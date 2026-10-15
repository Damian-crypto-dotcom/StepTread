import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { SignUp } from './pages/sign-up/sign-up';
import { Profile } from './pages/profile/profile';
import { Profilepro } from './pages/profilepro/profilepro';
import { Accountest } from './pages/accountest/accountest';
import { Deportes } from './pages/deportes/deportes';

export const routes: Routes = [
  // Redirección de la raíz hacia home
    { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'home', component: Home },
  { path: 'profile', component: Profile },
  { path: 'sign-up', component: SignUp },
  { path: 'profilepro', component: Profilepro },
  { path: 'accountest', component: Accountest },
  { path: 'deportes', component: Deportes },
  // Ruta por si escriben una URL que no existe
  { path: '**', redirectTo: 'home' }
];