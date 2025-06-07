import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UsuariosService } from '../services/usuarios.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const usuariosService = inject(UsuariosService);
  const currentUser = usuariosService.getCurrentUser();
  
  if (currentUser) {
    req = req.clone({
      setHeaders: {
        'X-User-ID': `${currentUser.UserID}`,
        'X-User-Role': currentUser.Role
      }
    });
  }
  
  return next(req);
};