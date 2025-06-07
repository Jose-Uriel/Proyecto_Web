import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  UserID: number;
  Username: string;
  Email: string;
  Role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:3000/api/users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) { 
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Only access localStorage in browser environment
    if (this.isBrowser) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  // Login method
  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(user => {
          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
        }),
        catchError(this.handleError)
      );
  }

  // Registration method
  register(userData: { username: string, password: string, email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      ...userData,
      Role: 'user'
    }).pipe(catchError(this.handleError));
  }

  // Logout method
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  // Get current user value
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && user.Role === 'admin';
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // Account verification method
  verifyAccount(username: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-account`, { username, email })
      .pipe(catchError(this.handleError));
  }

  // Password reset method
  resetPassword(username: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { username, newPassword })
      .pipe(catchError(this.handleError));
  }

  // Error handling helper method
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API error', error);
    return throwError(() => error);
  }
}
