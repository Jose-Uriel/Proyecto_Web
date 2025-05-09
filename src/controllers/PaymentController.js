const paypal = require('@paypal/checkout-server-sdk');
require('dotenv').config();

// Configurar el entorno y cliente de PayPal
function getPayPalClient() 
{
  const clientId = process.env.PAYPAL_CLIENT_ID || 'test';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'test';
  
  // Para entorno de pruebas
  const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  return new paypal.core.PayPalHttpClient(environment);
}

class PaymentController 
{
  // Crear una orden de PayPal
  async createOrder(req, res) 
  {
    try 
    {
      const { items, amount } = req.body;
      
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      
      request.requestBody
      ({
        intent: 'CAPTURE',
        purchase_units: 
        [{
          amount: 
          {
            currency_code: amount.currency_code,
            value: amount.value,
            breakdown: 
            {
              item_total: 
              {
                currency_code: amount.currency_code,
                value: amount.value
              }
            }
          },
          items: items.map(item => 
            ({
            name: item.name,
            unit_amount: item.unit_amount,
            quantity: item.quantity
          }))
        }]
      });
      
      const client = getPayPalClient();
      const response = await client.execute(request);
      
      return res.json
      ({
        id: response.result.id,
        status: response.result.status
      });
    } catch (error) 
    {
      console.error('Error al crear la orden:', error);
      return res.status(500).send('Error al crear la orden de PayPal');
    }
  }

  // Capturar un pago autorizado
  async captureOrder(req, res) {
    try {
      const { orderId } = req.body;
      
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.prefer("return=representation");
      
      const client = getPayPalClient();
      const response = await client.execute(request);
      
      // Aquí puedes guardar la información de la orden en tu base de datos
      // y actualizar el inventario si es necesario
      
      return res.json({
        id: response.result.id,
        status: response.result.status,
        payer: response.result.payer
      });
    } catch (error) {
      console.error('Error al capturar el pago:', error);
      return res.status(500).send('Error al procesar el pago con PayPal');
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
}

module.exports = new PaymentController();

