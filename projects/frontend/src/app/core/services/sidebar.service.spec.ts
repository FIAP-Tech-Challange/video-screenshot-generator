import { TestBed } from '@angular/core/testing';
import { SidebarService } from './sidebar.service';

describe('SidebarService', () => {
  let service: SidebarService;
  let localStorageMock: Record<string, string>;
  let innerWidth: number;

  beforeEach(() => {
    localStorageMock = {};
    innerWidth = 1024;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: innerWidth,
    });
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] ?? null),
        setItem: jest.fn((key: string, val: string) => {
          localStorageMock[key] = val;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          Object.keys(localStorageMock).forEach((k) => delete localStorageMock[k]);
        }),
      },
      writable: true,
      configurable: true,
    });
    jest.spyOn(window, 'addEventListener');
    TestBed.configureTestingModule({ providers: [SidebarService] });
    service = TestBed.inject(SidebarService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start not collapsed', (done) => {
    service.isCollapsed$.subscribe((v) => {
      expect(v).toBe(false);
      done();
    });
  });

  it('toggle should invert collapsed state', () => {
    expect(service.isCollapsed).toBe(false);
    service.toggle();
    expect(service.isCollapsed).toBe(true);
    service.toggle();
    expect(service.isCollapsed).toBe(false);
  });

  it('setCollapsed should update state', () => {
    service.setCollapsed(true);
    expect(service.isCollapsed).toBe(true);
    service.setCollapsed(false);
    expect(service.isCollapsed).toBe(false);
  });

  it('toggle should persist to localStorage', () => {
    service.toggle();
    expect(localStorage.setItem).toHaveBeenCalledWith('sidebarCollapsed', 'true');
  });

  it('toggleMobileMenu should toggle mobile menu open state', () => {
    expect(service.isMobileMenuOpen).toBe(false);
    service.toggleMobileMenu();
    expect(service.isMobileMenuOpen).toBe(true);
    service.toggleMobileMenu();
    expect(service.isMobileMenuOpen).toBe(false);
  });

  it('closeMobileMenu should set mobile menu to closed', () => {
    service.toggleMobileMenu();
    expect(service.isMobileMenuOpen).toBe(true);
    service.closeMobileMenu();
    expect(service.isMobileMenuOpen).toBe(false);
  });
});
