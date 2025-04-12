import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ProductoService {
  private apiURL = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) { }

  // Método para obtener todos los productos desde el API
  obtener_Productos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL).pipe(
      tap((data: any[]) => console.log('API response:', data)),
      catchError((error: any) => {
        console.error('Error fetching products:', error);
        return throwError(() => error);
      })
    );
  }

  /* 
  // Este método ahora obtendrá solo productos disponibles
  obtener_Producto(id: number): Observable<any> 
  {
    return this.http.get<any>(`${this.apiURL}/${id}`);
  }

  // Método para obtener productos desde el XML
  addProduct(product: any): Observable<any> 
  {
    return this.http.post<any>(this.apiURL, product);  
  }

  // Método para agregar un producto al inventario
  updateProduct(id: number, product: any): Observable<any> 
  {
    return this.http.put<any>(`${this.apiURL}/${id}`, product);
  }

  // Método para eliminar un producto
  deleteProduct(id: number): Observable<any> 
  {
    return this.http.delete<any>(`${this.apiURL}/${id}`);
  }
  */

  // Método para obtener productos desde XML
  /*
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
  */
}