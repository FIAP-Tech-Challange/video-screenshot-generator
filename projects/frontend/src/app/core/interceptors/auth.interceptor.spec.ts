import { TestBed } from '@angular/core/testing';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../../auth/services/auth.service';

describe('authInterceptor', () => {
  const authServiceMock = { getToken: jest.fn() };
  const mockEvent: HttpEvent<unknown> = new HttpResponse({ body: {} });

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });
  });

  function runInterceptor(
    url: string,
    token: string | null
  ): HttpRequest<unknown> {
    authServiceMock.getToken.mockReturnValue(token);
    let capturedReq: HttpRequest<unknown> | null = null;
    const next: HttpHandlerFn = (req) => {
      capturedReq = req;
      return of(mockEvent);
    };
    TestBed.runInInjectionContext(() => {
      authInterceptor(new HttpRequest('GET', url), next).subscribe();
    });
    return capturedReq!;
  }

  it('should add Authorization header for relative URL when token exists', () => {
    const req = runInterceptor('/api/users', 'jwt-token');
    expect(req.headers.get('Authorization')).toBe('Bearer jwt-token');
  });

  it('should not add Authorization for relative URL when no token', () => {
    const req = runInterceptor('/api/users', null);
    expect(req.headers.has('Authorization')).toBe(false);
  });

  it('should not add Authorization for absolute URL (e.g. presigned)', () => {
    authServiceMock.getToken.mockReturnValue('jwt-token');
    let capturedReq: HttpRequest<unknown> | null = null;
    const next: HttpHandlerFn = (req) => {
      capturedReq = req;
      return of(mockEvent);
    };
    TestBed.runInInjectionContext(() => {
      authInterceptor(
        new HttpRequest('GET', 'https://minio.example.com/upload'),
        next
      ).subscribe();
    });
    expect(capturedReq!.url).toBe('https://minio.example.com/upload');
    expect(capturedReq!.headers.has('Authorization')).toBe(false);
  });
});
