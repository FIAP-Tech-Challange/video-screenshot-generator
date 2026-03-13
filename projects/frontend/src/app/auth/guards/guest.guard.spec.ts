import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { guestGuard } from './guest.guard';
import { AuthService } from '../services/auth.service';

describe('guestGuard', () => {
  const authServiceMock = { isAuthenticated: jest.fn() };
  const createUrlTreeMock = jest.fn(() => ({} as UrlTree));

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: { createUrlTree: createUrlTreeMock } },
      ],
    });
  });

  it('should allow activation when not authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() => guestGuard(null!, null!));
    expect(result).toBe(true);
    expect(createUrlTreeMock).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    const urlTree = {} as UrlTree;
    createUrlTreeMock.mockReturnValue(urlTree);
    const result = TestBed.runInInjectionContext(() => guestGuard(null!, null!));
    expect(result).toBe(urlTree);
    expect(createUrlTreeMock).toHaveBeenCalledWith(['/dashboard']);
  });
});
