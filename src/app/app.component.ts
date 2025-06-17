import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // Asegúrate de importar ChangeDetectorRef
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { UsuariosService } from './services/usuarios.service';

interface User {
  UserID: number;
  Username: string;
  Email: string;
  Role: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule], // HttpClientModule no es necesario aquí
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Proyecto_Web';
  isLoggedIn = false;
  isAdmin = false;
  currentUser: User | null = null;
  private userSubscription!: Subscription;

  constructor(
    private usuariosService: UsuariosService,
    private router: Router,
    private cdr: ChangeDetectorRef // Asegúrate de inyectarlo
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.usuariosService.currentUser$.subscribe(user => {
      console.log('AppComponent SUBSCRIBER: currentUser$ emitted. User:', user); // LOG DE APPCOMPONENT 1
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.isAdmin = !!user && user.Role === 'admin';
      console.log('AppComponent SUBSCRIBER: State updated. isLoggedIn =', this.isLoggedIn, '| isAdmin =', this.isAdmin); // LOG DE APPCOMPONENT 2
      this.cdr.detectChanges(); // Forzar detección de cambios aquí es una buena prueba
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => { // Tipar event para acceder a urlAfterRedirects
      console.log(`AppComponent NavigationEnd: Navigated to ${event.urlAfterRedirects}. Checking login status consistency.`); // LOG DE APPCOMPONENT 3
      
      const serviceIsLoggedIn = this.usuariosService.isLoggedIn(); // Esto llamará al `isLoggedIn` con su propio log
      const componentIsLoggedIn = this.isLoggedIn;
      console.log(`AppComponent NavigationEnd: serviceIsLoggedIn=${serviceIsLoggedIn}, componentIsLoggedIn=${componentIsLoggedIn}`); // LOG DE APPCOMPONENT 4

      if (serviceIsLoggedIn !== componentIsLoggedIn) {
        console.warn('AppComponent NavigationEnd: DISCREPANCY DETECTED between service and component login state!');
        if (!serviceIsLoggedIn && componentIsLoggedIn) {
          console.warn('AppComponent NavigationEnd: Service says NOT logged in, but component IS. This might indicate state was reset in service. Component will update via subscription.');
          // No llames a logout aquí, confía en que la suscripción a currentUser$ actualizará el estado del componente.
          // Si el servicio emitió null, la suscripción de arriba ya debería haberlo manejado.
        } else if (serviceIsLoggedIn && !componentIsLoggedIn) {
          console.warn('AppComponent NavigationEnd: Service says LOGGED IN, but component IS NOT. Component might have missed an update or was initialized differently. Forcing update from service state.');
          const userFromService = this.usuariosService.currentUserValue;
          this.currentUser = userFromService;
          this.isLoggedIn = !!userFromService;
          this.isAdmin = !!userFromService && userFromService.Role === 'admin';
          this.cdr.detectChanges();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.usuariosService.logout();
  }
}
