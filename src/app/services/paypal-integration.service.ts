import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaypalIntegrationService {
  // Update this URL to match your API endpoint structure
  private apiUrl = 'http://localhost:3000/api/payments'; // Changed from '/api/pagos'

  constructor(private http: HttpClient) { }

  // Crear una orden de PayPal con los productos del carrito
  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order`, orderData);
  }

  // Capturar un pago autorizado
  capturePayment(orderId: string, items: any[]): Observable<any> {
    console.log(`Sending capture request for order ${orderId} with ${items.length} items`);
    
    return this.http.post<any>(`${this.apiUrl}/capture-order`, { 
      orderId,
      items
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Cancelar una orden
  cancelOrder(orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancel-order`, { orderId });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('PayPal service error:', error);
    let errorMessage = 'Error desconocido en el procesamiento del pago';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}