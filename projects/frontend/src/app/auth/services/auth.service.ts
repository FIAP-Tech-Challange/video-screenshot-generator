import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, switchMap, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { RegisterUser } from '../models/user.model';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export type AuthResult = { success: true } | { success: false; message: string };

interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string; name: string };
}

interface RegisterResponse {
  id: string;
  name: string;
  email: string;
}

interface JwtPayload {
  sub: string;
  email?: string;
}

/** Extrai mensagem de erro da resposta da API (NestJS) ou HttpErrorResponse */
function getErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    let msg: string | undefined;
    if (body?.message) {
      msg = Array.isArray(body.message) ? body.message[0] : body.message;
    }
    if (err.status === 0) return 'Erro de conexão. Verifique se a API está no ar.';
    if (err.status === 409) return 'Este email já está em uso.';
    if (err.status === 401) return 'Email ou senha inválidos.';
    if (err.status === 400 && msg) return msg;
    if (msg) return msg;
    return err.message || 'Erro ao processar a requisição.';
  }
  return 'Erro inesperado. Tente novamente.';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Login: POST /auth/login, armazena token e usuário (id, email, name da resposta).
   */
  login(email: string, password: string): Observable<AuthResult> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this.setToken(res.accessToken);
          this.setUser(res.user);
        }),
        switchMap(() => of({ success: true } as const)),
        catchError((err) => of({ success: false, message: getErrorMessage(err) }))
      );
  }

  /**
   * Cadastro: POST /auth/register (name, email, password). Em seguida faz login
   * para obter o token; armazena o usuário retornado no registro (com nome).
   */
  register(userData: RegisterUser): Observable<AuthResult> {
    const body = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
    };
    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/auth/register`, body)
      .pipe(
        switchMap((registeredUser) =>
          this.http
            .post<LoginResponse>(`${this.apiUrl}/auth/login`, {
              email: userData.email,
              password: userData.password,
            })
            .pipe(
              tap((res) => {
                this.setToken(res.accessToken);
                this.setUser(res.user);
              }),
              map((): AuthResult => ({ success: true })),
              catchError((err) =>
                of<AuthResult>({ success: false, message: getErrorMessage(err) })
              )
            )
        ),
        catchError((err) =>
          of<AuthResult>({ success: false, message: getErrorMessage(err) })
        )
      );
  }

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this.router.navigate(['/login']);
  }

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

  private setToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  private setUser(user: { id: string; email: string; name?: string }): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  private decodeUserFromToken(token: string): {
    id: string;
    email: string;
    name?: string;
  } {
    try {
      const payload = token.split('.')[1];
      if (!payload) return { id: '', email: '' };
      const decoded: JwtPayload = JSON.parse(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      );
      return {
        id: decoded.sub ?? '',
        email: decoded.email ?? '',
      };
    } catch {
      return { id: '', email: '' };
    }
  }
}
