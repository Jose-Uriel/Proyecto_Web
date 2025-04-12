import { Routes, RouterModule } from '@angular/router';
import { ProductoComponent } from './componentes/producto/producto.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';
import { InventarioComponent } from './componentes/inventario/inventario.component';
import { NgModule } from '@angular/core';
import { UsuariosComponent } from './componentes/usuarios/usuarios.component';
import { OrdenesComponent } from './componentes/ordenes/ordenes.component';

export const routes: Routes = [
  { path: '', redirectTo: '/productos', pathMatch: 'full' },
  { path: 'productos', component: ProductoComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'products', component: ProductoComponent },
  { path: 'users', component: UsuariosComponent },
  { path: 'orders', component: OrdenesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }