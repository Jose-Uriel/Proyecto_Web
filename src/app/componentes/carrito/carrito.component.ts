import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CarritoService } from '../../services/carrito.service';
import { PaypalIntegrationService } from '../../services/paypal-integration.service';
import { InventarioService } from '../../services/inventario.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

declare const paypal: any;

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})

export class CarritoComponent implements OnInit, OnDestroy, AfterViewInit {
  carrito: any[] = [];
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;
  isPaying: boolean = false;
  paymentStatus: string = '';
  private subscription?: Subscription;
  private paypalButtonRendered = false;

  constructor(
    private carritoService: CarritoService,
    private paypalService: PaypalIntegrationService,
    private inventarioService: InventarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('CarritoComponent inicializado');
    // Suscribirse a los cambios en el carrito
    this.subscription = this.carritoService.productos$.subscribe(productos => {
      console.log('Nuevos productos recibidos:', productos);
      this.carrito = productos;
      this.calcular_Totales();
    });
  }

  ngAfterViewInit(): void {
    if (this.carrito.length > 0) {
      this.loadPayPalScript();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadPayPalScript(): void {
    if (this.paypalButtonRendered) return;
    
    console.log('Cargando script de PayPal...');
    
    // Cargar el script de PayPal dinámicamente
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=ATrr48cY187PiycEnfS52bc3mM6US1OE5mhxKvF1jEPNdKn2OeOBbQIIfF_HfpSXEkIh3ktIEBA0edAw&currency=MXN';
    script.onload = () => {
      console.log('Script de PayPal cargado');
      this.renderPayPalButton();
    };
    script.onerror = (err) => {
      console.error('Error al cargar el script de PayPal:', err);
    };
    document.body.appendChild(script);
  }

  renderPayPalButton(): void {
    if (this.paypalButtonRendered) return;
    
    console.log('Intentando renderizar botón de PayPal');
    
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (!paypalButtonContainer) {
      console.error('No se encontró el contenedor del botón de PayPal');
      return;
    }
    
    this.paypalButtonRendered = true;
    
    paypal.Buttons({
      // Usa la API de PayPal para crear la orden
      createOrder: (data: any, actions: any) => {
        this.isPaying = true;
        this.paymentStatus = 'Procesando su pago...';
        
        // En lugar de retornar un ID simulado, usamos actions.order.create()
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: this.total.toFixed(2),
              currency_code: 'MXN',
              breakdown: {
                item_total: {
                  value: this.subtotal.toFixed(2),
                  currency_code: 'MXN'
                },
                tax_total: {
                  value: this.iva.toFixed(2),
                  currency_code: 'MXN'
                }
              }
            },
            items: this.carrito.map(item => ({
              name: item.nombre || 'Producto',
              quantity: item.cantidad || '1',
              unit_amount: {
                value: item.precio.toFixed(2),
                currency_code: 'MXN'
              }
            }))
          }]
        });
      },
      
      // Usa actions.order.capture() para finalizar el pago
      onApprove: (data: any, actions: any) => {
        this.paymentStatus = 'Pago aprobado. Finalizando...';
        console.log('PayPal onApprove data:', data);
        
        return actions.order.capture().then((details: any) => {
          console.log('PayPal capture details:', details);
          this.paymentStatus = '¡Pago completado con éxito!';
          
          // Prepare payment data
          const paymentData = {
            orderId: data.orderID,
            items: this.carrito
          };
          
          // Store order data for receipt
          localStorage.setItem('orderItems', JSON.stringify(this.carrito));
          localStorage.setItem('orderTotal', this.total.toString());
          localStorage.setItem('orderSubtotal', this.subtotal.toString());
          localStorage.setItem('orderIVA', this.iva.toString());
          localStorage.setItem('orderId', data.orderID);
          localStorage.setItem('orderDate', new Date().toISOString());
          
          // Send items to backend for stock update
          this.paypalService.capturePayment(data.orderID, this.carrito).subscribe({
            next: (response) => {
              console.log('Backend response:', response);
              // Navigate to receipt page
              this.isPaying = false;
              this.carritoService.vaciarCarrito(); // Clear cart without restocking
              this.router.navigate(['/recibo']);
            },
            error: (error) => {
              console.error('Error details:', error);
              this.paymentStatus = 'Error al procesar el pago en el servidor';
              
              // Navigate to receipt anyway since PayPal payment was successful
              setTimeout(() => {
                this.isPaying = false;
                this.carritoService.vaciarCarrito(); // Clear cart without restocking
                this.router.navigate(['/recibo']);
              }, 3000);
            }
          });
        }).catch((err: any) => {
          console.error('PayPal capture error:', err);
          this.paymentStatus = 'Error en el procesamiento del pago';
        });
      },
      
      onCancel: () => {
        console.log('Pago cancelado por el usuario');
        this.paymentStatus = 'Pago cancelado';
        this.isPaying = false;
        // Si se cancela, usar vaciarCarritoConDevolucion()
        this.carritoService.vaciarCarritoConDevolucion();
      },
      
      onError: (err: any) => {
        console.error('Error en el pago:', err);
        this.paymentStatus = 'Error en el pago. Por favor intente de nuevo.';
        this.isPaying = false;
      },
      
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      }
    }).render('#paypal-button-container');
    
    console.log('Botón de PayPal renderizado');
  }

  eliminar_Producto(index: number): void {
    this.carritoService.eliminarProducto(index);
  }

  incrementarCantidad(index: number): void {
    this.carritoService.incrementarCantidad(index);
  }

  decrementarCantidad(index: number): void {
    this.carritoService.decrementarCantidad(index);
  }

  calcular_Totales(): void {
    this.subtotal = this.carrito.reduce((acc, producto) => 
      acc + ((producto.precio || 0) * (producto.cantidad || 1)), 0);
    this.iva = this.subtotal * 0.16;
    this.total = this.subtotal + this.iva;
  }

  generar_XML(): void {
    const xml = this.carritoService.generar_XML();
    console.log('XML generado:', xml);
    alert('XML generado correctamente');
  }

  descargar_XML(): void {
    this.carritoService.descargar_XML();
    console.log('Descargando XML...');
  }
  
  procesarCompraExitosa(orderDetails: any): void {
    // Store order data in localStorage for reference
    localStorage.setItem('lastOrderDetails', JSON.stringify(orderDetails));
    
    // Store cart contents for the receipt
    localStorage.setItem('orderItems', JSON.stringify(this.carrito));
    localStorage.setItem('orderTotal', this.total.toString());
    localStorage.setItem('orderSubtotal', this.subtotal.toString());
    localStorage.setItem('orderIVA', this.iva.toString());
    
    // Only navigate if we're not already doing so in the timeout
    if (!this.isPaying) {
      this.router.navigate(['/recibo'], { 
        queryParams: { 
          orderId: orderDetails.id || '',
          date: new Date().toISOString()
        }
      });
    } else {
      // If isPaying is true, we're inside the PayPal flow
      // Modify the timeout callback in onApprove to navigate to receipt instead of productos
      // This is handled below in the onApprove method
    }
  }
}
