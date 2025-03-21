import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CarritoService } from '../../services/carrito.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit, OnDestroy 
{
  carrito: any[] = [];
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;
  private subscription?: Subscription;

  constructor(
    private carritoService: CarritoService
  ) { }

  ngOnInit(): void
  {
    console.log('CarritoComponent inicializado');
    // Suscribirse a los cambios en el carrito
    this.subscription = this.carritoService.productos$.subscribe(productos => {
      console.log('Nuevos productos recibidos:', productos);
      this.carrito = productos;
      this.calcular_Totales();
    });
  }

  ngOnDestroy(): void 
  {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  eliminar_Producto(index: number): void 
  {
    this.carritoService.eliminarProducto(index);
  }

  incrementarCantidad(index: number): void {
    this.carritoService.incrementarCantidad(index);
  }

  decrementarCantidad(index: number): void {
    this.carritoService.decrementarCantidad(index);
  }

  calcular_Totales(): void
  {
    this.subtotal = this.carrito.reduce((acc, producto) => 
      acc + ((producto.precio || 0) * (producto.cantidad || 1)), 0);
    this.iva = this.subtotal * 0.16;
    this.total = this.subtotal + this.iva;
  }

  // Corregir estos métodos para que llamen al servicio en lugar de a sí mismos
  generar_XML(): void {
    const xml = this.carritoService.generar_XML();
    console.log('XML generado:', xml);
    alert('XML generado correctamente');
  }

  descargar_XML(): void 
  {
    this.carritoService.descargar_XML();
    console.log('Descargando XML...');
  }
}
