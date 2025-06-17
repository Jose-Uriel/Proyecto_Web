import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { UsuariosService } from '../../services/usuarios.service'; // Changed from AuthService
import { Subscription } from 'rxjs';

interface User { // Define User interface if not already globally available
  UserID: number;
  Username: string;
  Email: string;
  Role: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [ProductoService], // ProductoService is usually providedIn: 'root' or in a module
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, OnDestroy {
  productos: any[] = [];
  currentUser: User | null = null;
  private userSubscription!: Subscription;

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private usuariosService: UsuariosService, // Use UsuariosService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.usuariosService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadProducts();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadProducts(): void {
    this.productoService.obtener_ProductosEnStock().subscribe({
      next: (data) => {
        this.productos = data.map(item => ({
          id: item.ProductID,
          nombre: item.Name,
          precio: item.Price,
          cantidad: item.Stock,
          imagen: item.Image || 'assets/Portatil/Nintendo/3DS/3DS/Normales/3DS.jpg',
          description: item.Description || '',
          categoryId: item.CategoryID
        }));
      },
      error: (error) => {
        console.error('Error al cargar productos para inicio:', error);
      }
    });
  }

  agregar_Al_Carrito(producto: any): void {
    const result = this.carritoService.agregar_Producto(producto);
    if (result) {
      alert('¡Producto añadido al carrito!');
    }
  }

  verDetalles(producto: any): void {
    this.router.navigate(['/producto', producto.id]);
  }
}