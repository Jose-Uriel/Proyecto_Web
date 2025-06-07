import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UsuariosService } from './services/usuarios.service';
import { Router } from '@angular/router';

@Component
({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit 
{
  title = 'Tienda de Juegos';
  isLoggedIn = false;
  isAdmin = false;
  currentUser: any;

  constructor
  (
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  ngOnInit(): void 
  {
    // Subscribe to the current user observable
    this.usuariosService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.isAdmin = this.usuariosService.isAdmin();
    });
  }

  logout(): void 
  {
    this.usuariosService.logout();
    this.router.navigate(['/login']);
  }
}
