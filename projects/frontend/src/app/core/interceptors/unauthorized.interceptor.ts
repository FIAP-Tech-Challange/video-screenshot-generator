import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../environments/environment';

const UNAUTH_ROUTES = [`${environment.apiUrl}/auth/login`, `${environment.apiUrl}/auth/register`];

/**
 * Interceptor que trata erros 401 (Unauthorized).
 * Quando a API retorna 401 em rotas protegidas (token expirado/inválido),
 * faz logout e redireciona o usuário para a tela de login.
 *
 * Não redireciona quando o 401 vem do próprio login/register
 * (credenciais inválidas - tratamento fica no componente).
 */
export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      if (error.status !== HttpStatusCode.Unauthorized) {
        return throwError(() => error);
      }

      const isAuthRequest = UNAUTH_ROUTES.some((route) =>
        req.url.toLowerCase().includes(route.toLowerCase())
      );

      if (isAuthRequest) {
        return throwError(() => error);
      }

      authService.logout();
      return throwError(() => error);
    })
  );
};
