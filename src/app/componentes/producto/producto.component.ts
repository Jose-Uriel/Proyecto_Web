import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';  
import { CarritoService } from '../../services/carrito.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, HttpClientModule],  
  providers: [ProductoService],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent implements OnInit 
{
  productos: any[] = [];

  constructor
  (
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private router: Router
  ) { }

  ngOnInit(): void 
  {
    this.productos = this.productoService.obtener_Producto();
    console.log('Productos cargados:', this.productos);
  }

  agregar_Al_Carrito(producto: any)
  {
    console.log('Agregando producto al carrito:', producto);
    this.carritoService.agregar_Producto(producto);
    alert('¡Producto añadido al carrito!');
  }

  ir_Al_Carrito()
  {
    this.router.navigate(['/carrito']);
  }

  ir_Al_Inventario() {
    this.router.navigate(['/inventario']);
  }

}
