import { Component, inject, computed } from '@angular/core';
import {
  Router,
  RouterOutlet,
  RouterLink,
  NavigationEnd,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthService } from '../../auth/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { VideosService } from '../../modules/videos/services/videos.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload': 'Upload',
  '/videos': 'Meus Vídeos',
  '/settings': 'Configurações',
};

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    NzIconModule,
    NzButtonModule,
    NzAvatarModule,
    NzBadgeModule,
    NzDropDownModule,
    NzMenuModule,
    SidebarComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly sidebarService = inject(SidebarService);
  private readonly router = inject(Router);
  readonly videosService = inject(VideosService);

  isCollapsed = toSignal(this.sidebarService.isCollapsed$, {
    initialValue: false,
  });
  isMobileMenuOpen = toSignal(this.sidebarService.isMobileMenuOpen$, {
    initialValue: false,
  });
  isMobile = toSignal(this.sidebarService.isMobile$, { initialValue: false });

  private currentPath = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url.split('?')[0]),
      startWith(this.router.url.split('?')[0])
    ),
    { initialValue: '' }
  );

  currentPageTitle = computed(
    () => PAGE_TITLES[this.currentPath()] ?? 'VideoFlow'
  );

  user = this.authService.getUser();

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.sidebarService.closeMobileMenu());
    this.videosService.refreshCompletedCount();
  }

  toggleSidebar(): void {
    if (this.sidebarService.isMobile) {
      this.sidebarService.toggleMobileMenu();
    } else {
      this.sidebarService.toggle();
    }
  }

  openMobileMenu(): void {
    this.sidebarService.toggleMobileMenu();
  }

  closeMobileMenu(): void {
    this.sidebarService.closeMobileMenu();
  }

  logout(): void {
    this.sidebarService.closeMobileMenu();
    this.authService.logout();
  }
}
