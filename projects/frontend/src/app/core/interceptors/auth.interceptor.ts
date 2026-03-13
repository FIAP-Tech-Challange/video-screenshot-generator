import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Adiciona o JWT apenas em requisições para a nossa API (URLs relativas como /api/...).
 * Requisições para URLs absolutas (ex.: MinIO presigned) não recebem o header.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isRelativeOrSameOrigin = req.url.startsWith('/');
  if (!isRelativeOrSameOrigin) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};
