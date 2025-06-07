import { Routes, RouterModule } from '@angular/router';
import { ProductoComponent } from './componentes/producto/producto.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';
import { InventarioComponent } from './componentes/inventario/inventario.component';
import { ReciboComponent } from './componentes/recibo/recibo.component';
import { LoginComponent } from './componentes/login/login.component';
import { AdminGuard } from './guards/admin.guard';
import { NgModule } from '@angular/core';
import { DetallesProductoComponent } from './componentes/detalles-producto/detalles-producto.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'productos', component: ProductoComponent },
  { path: 'producto/:id', component: DetallesProductoComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'recibo', component: ReciboComponent },
  // Protected route - only admins can access
  { path: 'inventario', component: InventarioComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }