import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { ProductoComponent } from '../../componentes/producto/producto.component';
import { ProductoService } from '../../services/producto.service';


@NgModule({
  imports: [
    CommonModule,
    ProductoComponent
  ],
  providers: [
    ProductoService,
    provideHttpClient()
  ]
})
export class ProductoModule { }
