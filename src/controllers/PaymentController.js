const paypal = require('@paypal/checkout-server-sdk');
const { poolPromise, sql } = require('../app/api/db'); // Import database connection
require('dotenv').config();

// Configurar el entorno y cliente de PayPal
function getPayPalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID || 'test';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'test';
  
  // Para entorno de pruebas
  const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  return new paypal.core.PayPalHttpClient(environment);
}

class PaymentController {
  // Crear una orden de PayPal
  async createOrder(req, res) {
    try {
      const { items, amount } = req.body;
      
      // Check stock availability before creating PayPal order
      const stockCheck = await this.checkStockAvailability(items);
      if (!stockCheck.available) {
        return res.status(400).json({
          status: 'ERROR',
          message: `Producto agotado o insuficiente stock`,
          details: stockCheck
        });
      }
      
      // Store order details for later use in session or temp database
      // This helps us know what items to update after payment
      req.session = req.session || {};
      req.session.orderItems = items;
      
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: amount.currency_code,
            value: amount.value,
            breakdown: {
              item_total: {
                currency_code: amount.currency_code,
                value: amount.value
              }
            }
          },
          items: items.map(item => ({
            name: item.name,
            unit_amount: item.unit_amount,
            quantity: item.quantity
          }))
        }]
      });
      
      const client = getPayPalClient();
      const response = await client.execute(request);
      
      return res.json({
        id: response.result.id,
        status: response.result.status
      });
    } catch (error) {
      console.error('Error al crear la orden:', error);
      return res.status(500).send('Error al crear la orden de PayPal');
    }
  }

  // Capturar un pago autorizado
  async captureOrder(req, res) {
    try {
      const { orderId, items } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ 
          status: 'ERROR', 
          message: 'Order ID is required' 
        });
      }
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        console.error('No valid items provided to update inventory');
        return res.status(400).json({ 
          status: 'ERROR', 
          message: 'Product data not provided' 
        });
      }
      
      // Log the items received
      console.log('Items received for stock update:', JSON.stringify(items));
      
      try {
        // Update inventory in database
        await this.updateProductStock(items);
        
        // Return success response
        return res.json({
          id: orderId,
          status: 'COMPLETED',
          message: 'Payment completed and stock updated'
        });
      } catch (inventoryError) {
        console.error('Error updating inventory:', inventoryError);
        return res.status(500).json({
          status: 'ERROR',
          message: 'Payment completed but failed to update inventory'
        });
      }
    } catch (error) {
      console.error('Error capturing payment:', error);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Error processing payment with PayPal',
        details: error.message
      });
    }
  }
  
  // Helper method to update product stock
  async updateProductStock(items) {
    try {
      const pool = await poolPromise;
      
      // Create a new transaction
      const transaction = new sql.Transaction(pool);
      
      try {
        // Begin transaction
        await transaction.begin();
        
        // Process each item in the cart
        for (const item of items) {
          console.log(`Actualizando stock para producto ${item.id}, reduciendo ${item.cantidad} unidades`);
          
          // Get current stock - use correct column name ProductID
          const result = await transaction.request()
            .input('id', sql.Int, item.id)
            .query('SELECT Stock FROM Products WHERE ProductID = @id');
          
          if (!result.recordset[0]) {
            console.error(`Producto con ID ${item.id} no encontrado`);
            continue;
          }
          
          const currentStock = result.recordset[0].Stock;
          const quantityToReduce = item.cantidad || 1; // Use cantidad or default to 1
          
          console.log(`Stock actual: ${currentStock}, Nuevo stock: ${currentStock - quantityToReduce}`);
          
          // Update stock - use correct column names ProductID and Stock
          await transaction.request()
            .input('id', sql.Int, item.id)
            .input('newStock', sql.Int, Math.max(0, currentStock - quantityToReduce))
            .query('UPDATE Products SET Stock = @newStock WHERE ProductID = @id');
        }
        
        // Commit transaction
        await transaction.commit();
        console.log('Inventario actualizado exitosamente después de la compra');
      } catch (error) {
        // Only rollback if the transaction has begun
        try {
          if (transaction._acquiredConfig) {
            await transaction.rollback();
            console.error('Error en la transacción, realizando rollback:', error);
          }
        } catch (rollbackError) {
          console.error('Error al hacer rollback:', rollbackError);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al actualizar el inventario:', error);
      throw new Error('Error al actualizar el inventario');
    }
  }
  
  // Add this after updating stock in captureOrder method
  async createOrderRecords(paypalResult, items) {
    try {
      const pool = await poolPromise;
      const transaction = await pool.transaction();
      
      try {
        // Create order record
        const orderResult = await transaction.request()
          .input('UserID', sql.Int, items[0].userId || 1) // Default if not provided
          .input('TotalAmount', sql.Decimal(10, 2), 
            items.reduce((total, item) => total + (item.precio * item.cantidad), 0))
          .input('Status', sql.NVarChar, 'Completado')
          .input('PaypalOrderID', sql.NVarChar, paypalResult.id)
          .query(`
            INSERT INTO Orders (UserID, OrderDate, TotalAmount, Status)
            OUTPUT INSERTED.OrderID
            VALUES (@UserID, GETDATE(), @TotalAmount, @Status)
          `);
        
        const orderId = orderResult.recordset[0].OrderID;
        
        // Create order detail records
        for (const item of items) {
          await transaction.request()
            .input('OrderID', sql.Int, orderId)
            .input('ProductID', sql.Int, item.id)
            .input('Quantity', sql.Int, item.cantidad)
            .input('Price', sql.Decimal(10, 2), item.precio)
            .query(`
              INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price)
              VALUES (@OrderID, @ProductID, @Quantity, @Price)
            `);
        }
        
        await transaction.commit();
        console.log(`Orden #${orderId} creada exitosamente`);
        return orderId;
      } catch (error) {
        await transaction.rollback();
        console.error('Error al crear registros de orden:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error al crear orden:', error);
      throw error;
    }
  }
  
  // Cancelar una orden
  async cancelOrder(req, res) {
    try {
      const { orderId } = req.body;
      // Aquí puedes implementar la lógica para cancelar la orden
      return res.json({ success: true, message: 'Orden cancelada' });
    } catch (error) {
      console.error('Error al cancelar la orden:', error);
      return res.status(500).send('Error al cancelar la orden');
    }
  }

  // Check stock availability
  async checkStockAvailability(items) {
    try {
      const pool = await poolPromise;
      
      for (const item of items) {
        const result = await pool.request()
          .input('id', sql.Int, item.id)
          .query('SELECT Stock FROM Products WHERE ProductID = @id');
        
        if (!result.recordset[0] || result.recordset[0].Stock < item.cantidad) {
          return {
            available: false,
            productId: item.id,
            requested: item.cantidad,
            available: result.recordset[0]?.Stock || 0
          };
        }
      }
      
      return { available: true };
    } catch (error) {
      console.error('Error checking stock:', error);
      throw error;
    }
  }
}

module.exports = new PaymentController();

