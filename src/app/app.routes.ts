import { Routes } from '@angular/router';
import { ProductoComponent } from './componentes/producto/producto.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';

export const routes: Routes = 
[
    {path: '',component: ProductoComponent},
    {path: 'carrito',component: CarritoComponent}
];
