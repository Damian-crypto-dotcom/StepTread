import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  errorMessage = '';

  form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    usuario: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    tipo: ['', Validators.required],
    terms: [false, Validators.requiredTrue]
  });

 async onSubmit() {
  console.log('1. Botón presionado');
  console.log('2. Formulario válido?', this.form.valid);
  console.log('3. Valores del formulario:', this.form.value);
  console.log('4. Errores del formulario:', this.form.errors);
  console.log('5. Estado de cada campo:', {
    nombre: this.form.get('nombre')?.errors,
    apellido: this.form.get('apellido')?.errors,
    email: this.form.get('email')?.errors,
    usuario: this.form.get('usuario')?.errors,
    password: this.form.get('password')?.errors,
    confirmPassword: this.form.get('confirmPassword')?.errors,
    tipo: this.form.get('tipo')?.errors,
    terms: this.form.get('terms')?.errors
  });

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    console.log('6. El formulario está INVÁLIDO → se detuvo aquí');
    this.errorMessage = 'Por favor completa todos los campos correctamente';
    return;
  }

  console.log('7. Formulario válido, intentando registrar...');

  const { password, confirmPassword, email, nombre, apellido, usuario, tipo } = this.form.value;

  if (password !== confirmPassword) {
    this.errorMessage = 'Las contraseñas no coinciden';
    console.log('8. Las contraseñas no coinciden');
    return;
  }

  this.loading = true;
  this.errorMessage = '';

  try {
    console.log('9. Llamando a AuthService.register...');
    await this.authService.register(email!, password!, {
      nombre,
      apellido,
      username: usuario,
      tipoCuenta: tipo
    });

 console.log('10. Registro exitoso');
console.log('Tipo de cuenta:', tipo);

// Redirigir a home (por ahora)
await this.router.navigate(['/home']);
    
    if (tipo === 'estudiante') {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/profilepro']);
    }
  } catch (error: any) {
    console.error('11. ERROR de Firebase:', error);
    console.error('Código del error:', error.code);
    console.error('Mensaje:', error.message);

    if (error.code === 'auth/email-already-in-use') {
      this.errorMessage = 'Este correo ya está registrado';
    } else if (error.code === 'auth/weak-password') {
      this.errorMessage = 'La contraseña es muy débil (mínimo 6 caracteres)';
    } else if (error.code === 'auth/invalid-email') {
      this.errorMessage = 'El correo no es válido';
    } else {
      this.errorMessage = 'Error: ' + (error.message || 'Intenta de nuevo');
    }
  } finally {
    this.loading = false;
  }
}
}