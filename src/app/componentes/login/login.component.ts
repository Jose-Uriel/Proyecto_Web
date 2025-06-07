import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  activeTab = 'login';
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  recoveryForm!: FormGroup;
  resetForm!: FormGroup;
  
  loginError = '';
  registerError = '';
  registerSuccess = '';
  recoveryError = '';
  resetError = '';
  resetSuccess = '';
  
  isLoading = false;
  verificationSuccess = false;
  recoveredUsername = '';

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialize login form
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // Initialize register form with validators
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
    
    // Initialize recovery form
    this.recoveryForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
    
    // Initialize reset password form
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value || form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value || form.get('confirmNewPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    // Reset form state
    this.loginError = '';
    this.registerError = '';
    this.registerSuccess = '';
    this.recoveryError = '';
    this.resetError = '';
    this.resetSuccess = '';
    this.verificationSuccess = false;
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.loginError = '';
    
    const { username, password } = this.loginForm.value;

    this.usuariosService.login(username, password).subscribe({
      next: (user) => {
        this.isLoading = false;
        // Navigate to the appropriate page after login
        if (this.usuariosService.isAdmin()) {
          this.router.navigate(['/inventario']);
        } else {
          this.router.navigate(['/productos']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loginError = err.error?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.registerError = '';
    this.registerSuccess = '';
    
    const { username, email, password } = this.registerForm.value;

    this.usuariosService.register({ username, email, password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.registerSuccess = 'Registro exitoso. Ahora puedes iniciar sesión.';
        this.registerForm.reset();
        // Switch to login tab after successful registration
        setTimeout(() => {
          this.setActiveTab('login');
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.registerError = err.error?.message || 'Error al registrarse. Intente nuevamente.';
      }
    });
  }
  
  onVerifyAccount(): void {
    if (this.recoveryForm.invalid) return;
    
    this.isLoading = true;
    this.recoveryError = '';
    
    const { username, email } = this.recoveryForm.value;
    
    this.usuariosService.verifyAccount(username, email).subscribe({
      next: () => {
        this.isLoading = false;
        this.verificationSuccess = true;
        this.recoveredUsername = username;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.recoveryError = err.error?.message || 'No se pudo verificar la cuenta. Verifique sus datos.';
      }
    });
  }
  
  onResetPassword(): void {
    if (this.resetForm.invalid) return;
    
    this.isLoading = true;
    this.resetError = '';
    
    const { newPassword } = this.resetForm.value;
    
    this.usuariosService.resetPassword(this.recoveredUsername, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.resetSuccess = 'Contraseña actualizada correctamente.';
        this.resetForm.reset();
        this.verificationSuccess = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.resetError = err.error?.message || 'Error al cambiar la contraseña. Intente nuevamente.';
      }
    });
  }
}
