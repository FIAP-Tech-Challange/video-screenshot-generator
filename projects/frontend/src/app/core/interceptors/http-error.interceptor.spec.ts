import { TestBed } from '@angular/core/testing';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  const mockEvent = new HttpResponse({ body: {} });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should pass through successful responses', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const next: HttpHandlerFn = () => of(mockEvent);
    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(req, next).subscribe({
        next: () => {
          expect(console.error).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  it('should log and rethrow errors', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const err = new HttpErrorResponse({ url: '/api/test', status: 500 });
    const next: HttpHandlerFn = () => throwError(() => err);
    TestBed.runInInjectionContext(() => {
      httpErrorInterceptor(req, next).subscribe({
        error: (e) => {
          expect(console.error).toHaveBeenCalledWith('HTTP Error:', err);
          expect(e).toBe(err);
          done();
        },
      });
    });
  });
});
