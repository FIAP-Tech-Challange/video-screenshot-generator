import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const routerMock = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: Router, useValue: routerMock }],
    });
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
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
      expect(result).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.getToken()).toBe('mock-token');
      expect(service.getUser()?.email).toBe('test@test.com');
      done();
    });
  });

  it('logout should clear state and navigate to login', () => {
    service.login('test@test.com', 'pass').subscribe(() => {
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getToken()).toBeNull();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  it('register should complete without error', (done) => {
    service
      .register({
        name: 'João Silva',
        email: 'new@test.com',
        password: 'Pass123!',
        confirmPassword: 'Pass123!',
        phone: '(11) 98765-4321',
        cpf: '123.456.789-09',
      })
      .subscribe((result) => {
        expect(result).toBe(true);
        done();
      });
  });
});
