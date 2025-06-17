import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; // Import Inject, PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

interface User {
  UserID: number;
  Username: string;
  Email: string;
  Role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:3000/api/usuarios';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getInitialUser());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  private getInitialUser(): User | null {
    if (isPlatformBrowser(this.platformId)) { // Check if in browser
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
    return null; // Return null if not in browser
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    console.log('UsuariosService: login method called for username:', username);
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        console.log('UsuariosService login tap: API response received:', response);
        
        // AJUSTA ESTA CONDICIÓN Y LA EXTRACCIÓN DE DATOS
        // Asumamos que el backend devuelve el usuario en la raíz y el token como 'accessToken'
        // Si no hay token, puedes quitar la comprobación de response.accessToken
        if (response && response.UserID && response.Username && response.Role /* && response.accessToken */) {
          const user: User = {
            UserID: response.UserID,
            Username: response.Username,
            Email: response.Email, // Asegúrate que el backend lo devuelva si lo necesitas
            Role: response.Role
          };
          
          const tokenToStore = response.accessToken || response.token; // O como se llame tu token

          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            if (tokenToStore) { // Solo guarda el token si existe
                localStorage.setItem('authToken', tokenToStore);
            }
          }
          console.log('UsuariosService login tap: Emitting user to currentUserSubject:', user);
          this.currentUserSubject.next(user);
        } else {
          console.error('UsuariosService login tap: Login response invalid or missing required user fields/token. Emitting null. Response was:', response);
          this.currentUserSubject.next(null);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
          }
        }
      }),
      catchError(error => {
        console.error('UsuariosService login catchError: API error:', error);
        console.log('UsuariosService login catchError: Emitting null due to error.');
        this.currentUserSubject.next(null);
        return this.handleError(error);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      catchError(this.handleError)
    );
  }

  verifyAccount(username: string, email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-account`, { username, email }).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(username: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/reset-password`, { username, newPassword }).pipe(
      catchError(this.handleError)
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) { // Check if in browser
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const hasUserInSubject = !!this.currentUserSubject.value;
    // LOG ADICIONAL DENTRO DE isLoggedIn
    console.log(`UsuariosService isLoggedIn CHECK: currentUserSubject.value is ${JSON.stringify(this.currentUserSubject.value)}, so hasUserInSubject is ${hasUserInSubject}`);
    
    // Si hay un usuario en el BehaviorSubject, consideramos que está logueado para la sesión actual.
    // localStorage se usa más para persistencia entre sesiones y carga inicial.
    return hasUserInSubject;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.Role === 'admin';
  }

  getAuthToken(): string | null {
    if (isPlatformBrowser(this.platformId)) { // Check if in browser
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
