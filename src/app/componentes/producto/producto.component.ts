import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { InventarioService } from '../../services/inventario.service'; // For loading categories

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule], // Add FormsModule
  providers: [ProductoService, InventarioService], // Ensure InventarioService is provided
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent implements OnInit {
  allProducts: any[] = []; // To store all products before filtering
  productos: any[] = []; // Products to display after filtering
  categorias: any[] = [];

  // Filter properties
  selectedCategoryId: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private inventarioService: InventarioService, // To load categories
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadInitialProducts();
    this.loadCategories();
  }

  loadInitialProducts(): void {
    this.productoService.obtener_ProductosEnStock().subscribe({
      next: (data) => {
        this.allProducts = data.map(item => ({
          id: item.ProductID,
          nombre: item.Name,
          precio: item.Price,
          cantidad: item.Stock,
          imagen: item.Image || 'assets/Portatil/Nintendo/3DS/3DS/Normales/3DS.jpg',
          description: item.Description || '',
          categoryId: item.CategoryID
        }));
        this.productos = [...this.allProducts]; // Initially display all products
        console.log('Productos en stock cargados:', this.allProducts);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  loadCategories(): void {
    // Assuming InventarioService has a method to get categories similar to how it's used in InventarioComponent
    this.inventarioService.getCategories().subscribe({
      next: (data) => {
        this.categorias = data;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allProducts];

    if (this.selectedCategoryId) {
      filtered = filtered.filter(p => p.categoryId === this.selectedCategoryId);
    }
    if (this.minPrice !== null && this.minPrice !== undefined && !isNaN(this.minPrice)) {
      filtered = filtered.filter(p => p.precio >= Number(this.minPrice));
    }
    if (this.maxPrice !== null && this.maxPrice !== undefined && !isNaN(this.maxPrice)) {
      filtered = filtered.filter(p => p.precio <= Number(this.maxPrice));
    }
    this.productos = filtered;
  }

  resetFilters(): void {
    this.selectedCategoryId = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.productos = [...this.allProducts];
  }

  agregar_Al_Carrito(producto: any): boolean {
    console.log('Agregando producto al carrito:', producto);
    if (!producto || !producto.id) {
      console.error('Producto inválido:', producto);
      return false;
    }
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

  verDetalles(producto: any) {
    this.router.navigate(['/producto', producto.id]);
  }
}