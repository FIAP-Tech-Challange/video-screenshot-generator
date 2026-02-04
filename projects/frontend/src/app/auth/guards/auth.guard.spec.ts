import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  const authServiceMock = { isAuthenticated: jest.fn() };
  const routerMock = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should allow activation when authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() => authGuard(null!, null!));
    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when not authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() => authGuard(null!, null!));
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
