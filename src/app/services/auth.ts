import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user,
  User
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc
} from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Observable del usuario actual
  user$ = user(this.auth);

  // REGISTRO
  async register(email: string, password: string, extraData: any) {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = credential.user.uid;

    // Guardar datos extra en Firestore
    await setDoc(doc(this.firestore, `users/${uid}`), {
      uid,
      email,
      ...extraData,
      createdAt: new Date()
    });

    return credential.user;
  }

  // LOGIN
  async login(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    return credential.user;
  }

  // CERRAR SESIÓN
  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}