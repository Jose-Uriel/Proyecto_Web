import { Component } from '@angular/core';
import { ProductoComponent } from "./componentes/producto/producto.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component
({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.component.css'
})
export class AppComponent 
{
  title = 'proyecto_clase_1';
}
