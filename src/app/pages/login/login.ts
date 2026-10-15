import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false]
  });

  async onSubmit() {
    console.log('Login - botón presionado');
    console.log('Formulario válido?', this.form.valid);
    console.log('Valores:', this.form.value);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Completa el correo y la contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;

    try {
      console.log('Llamando a AuthService.login...');
      await this.authService.login(email!, password!);
      console.log('Login exitoso, redirigiendo a /home');
      
      // Va DIRECTO a home
      await this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error de login:', error);
      console.error('Código:', error.code);

      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/invalid-email'
      ) {
        this.errorMessage = 'Correo o contraseña incorrectos';
      } else {
        this.errorMessage = 'Error al iniciar sesión. Intenta de nuevo.';
      }
    } finally {
      this.loading = false;
    }
  }
}