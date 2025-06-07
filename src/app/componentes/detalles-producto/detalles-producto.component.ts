import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-detalles-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalles-producto.component.html',
  styleUrls: ['./detalles-producto.component.css']
})
export class DetallesProductoComponent implements OnInit {
  producto: any = {};
  cantidad: number = 1;
  cargando: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id']; // Convert to number
      this.cargarProducto(id);
    });
  }

  cargarProducto(id: number): void {
    this.cargando = true;
    this.productoService.obtener_Producto(id).subscribe({
      next: (data) => {
        if (data) {
          this.producto = {
            id: data.ProductID,
            nombre: data.Name,
            precio: data.Price,
            cantidad: data.Stock,
            imagen: data.Image || 'assets/Portatil/Nintendo/3DS/3DS/Normales/3DS.jpg',
            description: data.Description || 'No hay descripción disponible',
            categoryId: data.CategoryID
          };
        } else {
          this.error = 'Producto no encontrado';
        }
        this.cargando = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el producto';
        console.error('Error al cargar el producto:', error);
        this.cargando = false;
      }
    });
  }

  disminuirCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  aumentarCantidad(): void {
    if (this.cantidad < this.producto.cantidad) {
      this.cantidad++;
    } else {
      alert('No hay más unidades disponibles');
    }
  }

  agregarAlCarrito(): void {
    if (this.producto && this.producto.id) {
      // Create a copy of the product with the selected quantity
      const productoParaCarrito = {
        ...this.producto,
        cantidadSeleccionada: this.cantidad
      };
      
      // Add to cart (multiple units at once)
      for (let i = 0; i < this.cantidad; i++) {
        this.carritoService.agregar_Producto(this.producto);
      }
      
      alert('¡Producto(s) añadido(s) al carrito!');
    }
  }

  volverAlCatalogo(): void {
    this.router.navigate(['/productos']);
  }
}
