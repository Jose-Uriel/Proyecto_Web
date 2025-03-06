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

  constructor
  (
    private carritoService:CarritoService
  ) { }

  ngOnInit()
  {
    this.carrito = this.carritoService.obtener_Carrito();
  }

  eliminar_Producto(index:number)
  {
    this.carritoService.eliminar_Producto(index);
  }

  generar_XML()
  {
    this.carritoService.generar_XML();
  }

  descargar_XML()
  {
    this.carritoService.descargar_XML();
  }
}
