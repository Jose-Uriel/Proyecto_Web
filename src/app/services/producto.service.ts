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

  // Método para obtener productos en stock
  obtener_ProductosEnStock(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/instock`);
  }

  // Método para obtener un producto por ID
  obtener_Producto(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/${id}`);
  }
}