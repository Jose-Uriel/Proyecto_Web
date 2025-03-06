import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { Router } from '@angular/router';

@Component
({
  selector: 'app-producto',
  imports: [CommonModule],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})

export class ProductoComponent implements OnInit 
{
  productos: any[] = [];
  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private router:Router
  ) { }

  ngOnInit(): void 
  {
    this.productos = this.productoService.obtener_Producto();
  }

  agregar_Al_Carrito(producto:any)
  {
    this.carritoService.agregar_Producto(producto);
  }

  ir_Al_Carrito()
  {
    this.router.navigate(['/carrito']);
  }

}
