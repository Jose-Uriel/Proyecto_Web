import { Routes, RouterModule } from '@angular/router';
import { ProductoComponent } from './componentes/producto/producto.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';
import { InventarioComponent } from './componentes/inventario/inventario.component';
import { ReciboComponent } from './componentes/recibo/recibo.component';
import { LoginComponent } from './componentes/login/login.component';
import { AdminGuard } from './guards/admin.guard';
import { NgModule } from '@angular/core';
import { DetallesProductoComponent } from './componentes/detalles-producto/detalles-producto.component';
import { InicioComponent } from './componentes/inicio/inicio.component';

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'productos', component: ProductoComponent },
  { path: 'carrito', loadComponent: () => import('./componentes/carrito/carrito.component').then(m => m.CarritoComponent) },
  { path: 'producto/:id', loadComponent: () => import('./componentes/detalles-producto/detalles-producto.component').then(m => m.DetallesProductoComponent) },
  { path: 'login', loadComponent: () => import('./componentes/login/login.component').then(m => m.LoginComponent) },
  { path: 'inventario', loadComponent: () => import('./componentes/inventario/inventario.component').then(m => m.InventarioComponent), canActivate: [AdminGuard] },
  { path: 'recibo', loadComponent: () => import('./componentes/recibo/recibo.component').then(m => m.ReciboComponent) },
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: '**', redirectTo: '/inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }