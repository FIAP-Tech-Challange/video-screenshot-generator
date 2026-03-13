import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';

describe('authGuard (core)', () => {
  const routerMock = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerMock }],
    });
  });

  it('should redirect to auth/login when not authenticated', () => {
    const result = TestBed.runInInjectionContext(() => authGuard(null!, null!));
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should not allow activation (TODO: implement real auth check)', () => {
    const result = TestBed.runInInjectionContext(() => authGuard(null!, null!));
    expect(result).toBe(false);
  });
});
