import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ProductoComponent } from './app/componentes/producto/producto.component';
import { provideRouter } from '@angular/router';
import { Routes } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication
(
  AppComponent, 
  {providers: [provideRouter(routes)]}
)
  .catch((err) => console.error(err));
