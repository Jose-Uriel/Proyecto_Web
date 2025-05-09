import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaypalIntegrationService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) { }

  // Crear una orden de PayPal con los productos del carrito
  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order`, orderData);
  }

  // Capturar un pago autorizado
  capturePayment(orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/capture-order`, { orderId });
  }

  // Cancelar una orden
  cancelOrder(orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancel-order`, { orderId });
  }
}