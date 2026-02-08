import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

const FAKE_JWT =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSJ9.x';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const routerMock = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: Router, useValue: routerMock }],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be authenticated initially', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('login should set authenticated and store token', (done) => {
    service.login('test@test.com', 'password').subscribe((result) => {
      expect(result.success).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.getToken()).toBe(FAKE_JWT);
      expect(service.getUser()?.email).toBe('test@test.com');
      expect(service.getUser()?.id).toBe('user-123');
      done();
    });
    const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush({ accessToken: FAKE_JWT });
  });

  it('logout should clear state and navigate to login', () => {
    service.login('test@test.com', 'pass').subscribe(() => {
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getToken()).toBeNull();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
    httpMock.expectOne((r) => r.url.includes('/auth/login')).flush({ accessToken: FAKE_JWT });
  });

  it('register should call register then login and store user', (done) => {
    service
      .register({
        name: 'João Silva',
        email: 'new@test.com',
        password: 'Pass123!',
        confirmPassword: 'Pass123!',
      })
      .subscribe((result) => {
        expect(result.success).toBe(true);
        expect(service.getUser()?.name).toBe('João Silva');
        expect(service.getUser()?.email).toBe('new@test.com');
        expect(service.getToken()).toBe(FAKE_JWT);
        done();
      });
    const registerReq = httpMock.expectOne((r) => r.url.includes('/auth/register'));
    expect(registerReq.request.body).toEqual({
      name: 'João Silva',
      email: 'new@test.com',
      password: 'Pass123!',
    });
    registerReq.flush({ id: 'user-1', name: 'João Silva', email: 'new@test.com' });
    const loginReq = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    loginReq.flush({ accessToken: FAKE_JWT });
  });
});
