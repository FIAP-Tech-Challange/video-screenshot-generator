import { TestBed } from '@angular/core/testing';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpStatusCode,
  HttpResponse,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { unauthorizedInterceptor } from './unauthorized.interceptor';
import { AuthService } from '../../auth/services/auth.service';

describe('unauthorizedInterceptor', () => {
  const authServiceMock = { logout: jest.fn() };
  const mockEvent = new HttpResponse({ body: {} });

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });
  });

  it('should not call logout on success', (done) => {
    const req = new HttpRequest('GET', '/api/users');
    const next: HttpHandlerFn = () => of(mockEvent);
    TestBed.runInInjectionContext(() => {
      unauthorizedInterceptor(req, next).subscribe({
        next: () => {
          expect(authServiceMock.logout).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  it('should call logout on 401 for protected route', (done) => {
    const req = new HttpRequest('GET', '/api/videos');
    const err = new HttpErrorResponse({
      url: '/api/videos',
      status: HttpStatusCode.Unauthorized,
      statusText: 'Unauthorized',
    });
    const next: HttpHandlerFn = () => throwError(() => err);
    TestBed.runInInjectionContext(() => {
      unauthorizedInterceptor(req, next).subscribe({
        error: () => {
          expect(authServiceMock.logout).toHaveBeenCalled();
          done();
        },
      });
    });
  });

  it('should not call logout on 401 for login', (done) => {
    const req = new HttpRequest('POST', '/api/auth/login', null);
    const err = new HttpErrorResponse({
      url: '/api/auth/login',
      status: HttpStatusCode.Unauthorized,
    });
    const next: HttpHandlerFn = () => throwError(() => err);
    TestBed.runInInjectionContext(() => {
      unauthorizedInterceptor(req, next).subscribe({
        error: () => {
          expect(authServiceMock.logout).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  it('should not call logout on 401 for register', (done) => {
    const req = new HttpRequest('POST', '/api/auth/register', null);
    const err = new HttpErrorResponse({
      url: '/api/auth/register',
      status: HttpStatusCode.Unauthorized,
    });
    const next: HttpHandlerFn = () => throwError(() => err);
    TestBed.runInInjectionContext(() => {
      unauthorizedInterceptor(req, next).subscribe({
        error: () => {
          expect(authServiceMock.logout).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });
});
