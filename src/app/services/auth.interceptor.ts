import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuariosService } from './usuarios.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private usuariosService: UsuariosService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = this.usuariosService.getAuthToken();

    // Clona la solicitud para agregar el nuevo header.
    // Solo añade el token si existe y si la URL no es la de login/register
    // (o cualquier otra URL pública que no necesite token)
    if (authToken && !request.url.includes('/login') && !request.url.includes('/register')) {
      const authReq = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${authToken}`)
      });
      return next.handle(authReq);
    }

    return next.handle(request);
  }
}
