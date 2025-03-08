import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';

@Component
({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})

export class CarritoComponent 
{
  carrito:any[] = [];
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;

  constructor
  (
    private carritoService:CarritoService
  ) { }

  ngOnInit()
  {
    this.carrito = this.carritoService.obtener_Carrito();
    this.calcular_Totales();
  }

  eliminar_Producto(index:number)
  {
    this.carritoService.eliminar_Producto(index);
    this.carrito = this.carritoService.obtener_Carrito();
    this.calcular_Totales();
  }

  generar_XML()
  {
    this.carritoService.generar_XML();
  }

  descargar_XML()
  {
    this.carritoService.descargar_XML();
  }

  calcular_Totales() {
    this.subtotal = this.carrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    this.iva = this.subtotal * 0.16; // Assuming IVA is 16%
    this.total = this.subtotal + this.iva;
  }

  
}
