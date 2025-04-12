import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';  
import { CarritoService } from '../../services/carrito.service';
import { InventarioService } from '../../services/inventario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, HttpClientModule],  
  providers: [ProductoService],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})

export class ProductoComponent implements OnInit {
  productos: any[] = [];
  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private inventarioService: InventarioService, // Add this injection
    private router: Router
  ) { }

  ngOnInit(): void {
    this.productoService.obtener_Productos().subscribe({
      next: (data) => {
        // Mapear los datos del API a la estructura que espera el HTML
        this.productos = data.map(item => ({
          id: item.ProductID,
          nombre: item.Name, 
          precio: item.Price,
          cantidad: item.Stock,
          imagen: item.Image || 'assets/Portatil/Nintendo/3DS/3DS/Normales/3DS.jpg'
        }));
        console.log('Productos cargados:', this.productos);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  agregar_Al_Carrito(producto: any): boolean {
    console.log('Agregando producto al carrito:', producto);
    
    if (!producto || !producto.id) {
      console.error('Producto inválido:', producto);
      return false;
    }
    
    // Instead of manipulating cart logic here, delegate to CarritoService
    const result = this.carritoService.agregar_Producto(producto);
    if (result) {
      alert('¡Producto añadido al carrito!');
    }
    return result;
  }

  ir_Al_Carrito() {
    this.router.navigate(['/carrito']);
  }

  ir_Al_Inventario() {
    this.router.navigate(['/inventario']);
  }
}