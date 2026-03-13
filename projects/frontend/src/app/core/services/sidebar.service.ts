import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'sidebarCollapsed';
const MOBILE_BREAKPOINT = 768;

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  private isMobileMenuOpenSubject = new BehaviorSubject<boolean>(false);
  private isMobileSubject = new BehaviorSubject<boolean>(false);

  isCollapsed$ = this.isCollapsedSubject.asObservable();
  isMobileMenuOpen$ = this.isMobileMenuOpenSubject.asObservable();
  isMobile$ = this.isMobileSubject.asObservable();

  get isCollapsed(): boolean {
    return this.isCollapsedSubject.value;
  }

  get isMobileMenuOpen(): boolean {
    return this.isMobileMenuOpenSubject.value;
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        this.isCollapsedSubject.next(JSON.parse(saved));
      }
    }
    this.detectMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.detectMobile());
    }
  }

  toggle(): void {
    const next = !this.isCollapsedSubject.value;
    this.isCollapsedSubject.next(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }

  setCollapsed(value: boolean): void {
    this.isCollapsedSubject.next(value);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpenSubject.next(!this.isMobileMenuOpenSubject.value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpenSubject.next(false);
  }

  private detectMobile(): void {
    if (typeof window === 'undefined') return;
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    this.isMobileSubject.next(mobile);
    if (mobile) {
      this.setCollapsed(true);
    }
  }
}
