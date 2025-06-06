import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  inventario: Producto[] = [];
  productoActual: Producto = new Producto(0, '', 0, 0, '', 1, '');
  modoEdicion: boolean = false;
  productosDisponibles: number = 0;
  valorTotalInventario: number = 0;
  categorias: any[] = []; // Add this line to store categories

  constructor(private inventarioService: InventarioService) { }

  ngOnInit(): void {
    this.cargarInventario();
    this.cargarCategorias(); // Add this line to load categories
  }

  // Add this method to load categories
  cargarCategorias(): void {
    this.inventarioService.getCategories().subscribe({
      next: (data) => {
        this.categorias = data;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  cargarInventario(): void 
  {
    this.inventario = this.inventarioService.obtenerInventarioCompleto();
    this.calcularEstadisticas();
  }

  calcularEstadisticas(): void 
  {
    this.productosDisponibles = this.inventario.filter(p => p.cantidad > 0).length;
    this.valorTotalInventario = this.inventario.reduce((suma, p) => suma + (p.precio * p.cantidad), 0);
  }

  guardarProducto(): void 
  {
    if (this.modoEdicion) 
    {
      this.inventarioService.actualizarProducto(this.productoActual);
    } 
    else 
    {
      this.inventarioService.agregarProducto(this.productoActual);
    }
    
    this.resetForm();
    this.cargarInventario();
  }

  editarProducto(producto: Producto): void 
  {
    this.productoActual = { ...producto };
    this.modoEdicion = true;
  }

  eliminarProducto(id: number): void 
  {
    if (confirm('¿Está seguro de eliminar este producto?')) 
    {
      this.inventarioService.eliminarProducto(id);
      this.cargarInventario();
    }
  }

  cancelarEdicion(): void 
  {
    this.resetForm();
  }

  resetForm(): void 
  {
    this.productoActual = new Producto(0, '', 0, 0, '', 1, '');
    this.modoEdicion = false;
  }

  // Método para descargar el XML del inventario
  descargar_XML(): void 
  {
    this.inventarioService.descargar_XML();
  }
}
