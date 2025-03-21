import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InventarioService } from './inventario.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private xmlUrl = 'assets/productos.xml';

  constructor(
    private http: HttpClient,
    private inventarioService: InventarioService
  ) { }

  // Este método ahora obtendrá solo productos disponibles
  obtener_Producto(): Producto[] {
    return this.inventarioService.obtenerProductosDisponibles();
  }

  // Método para obtener productos desde XML
  obtener_Productos(): Observable<any[]> {
    return this.http.get(this.xmlUrl, { responseType: 'text' }).pipe(
      map(xml => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const productos = Array.from(xmlDoc.querySelectorAll('producto')).map(producto => ({
          id: producto.getElementsByTagName('id')[0].textContent,
          nombre: producto.getElementsByTagName('nombre')[0].textContent,
        }));
        return productos;
      })
    );
  }
}