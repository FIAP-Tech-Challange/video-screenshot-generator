import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import type { RegisterUser } from '../models/user.model';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

/** Dados mockados do usuário para permanecer logado até clicar em Sair */
const MOCK_USER = {
  email: '',
  id: 'mock-id',
  name: 'Usuário',
} as const;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);

  /** Mock: persiste token e usuário no localStorage; usuário permanece logado até logout */
  login(email: string, password: string, name?: string): Observable<boolean> {
    void password;
    return of(true).pipe(
      delay(800),
      tap(() => {
        const user = {
          email,
          id: MOCK_USER.id,
          name: name ?? MOCK_USER.name,
        };
        localStorage.setItem(AUTH_TOKEN_KEY, 'mock-token');
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      })
    );
  }

  register(userData: RegisterUser): Observable<boolean> {
    return of(true).pipe(
      delay(800),
      tap(() => {
        // Mock: após registro, pode fazer auto-login com os dados
        const user = {
          email: userData.email,
          id: MOCK_USER.id,
          name: userData.name ?? MOCK_USER.name,
        };
        localStorage.setItem(AUTH_TOKEN_KEY, 'mock-token');
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this.router.navigate(['/login']);
  }

  /** Fonte da verdade: localStorage. Usuário permanece logado até clicar em Sair */
  isAuthenticated(): boolean {
    return (
      typeof localStorage !== 'undefined' &&
      !!localStorage.getItem(AUTH_TOKEN_KEY)
    );
  }

  getToken(): string | null {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem(AUTH_TOKEN_KEY)
      : null;
  }

  getUser(): { email: string; id?: string; name?: string } | null {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as {
        email: string;
        id?: string;
        name?: string;
      };
    } catch {
      return null;
    }
  }
}
