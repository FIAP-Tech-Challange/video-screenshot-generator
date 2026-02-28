import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import type { MenuItem } from '../../core/models/menu-item.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NzIconModule,
    NzButtonModule,
    NzBadgeModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly router = inject(Router);

  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      theme: 'outline',
      title: 'Dashboard - Visualize suas estatísticas',
    },
    {
      id: 'upload',
      label: 'Upload',
      icon: 'cloud-upload',
      route: '/upload',
      theme: 'outline',
      title: 'Upload - Envie novos vídeos',
      badge: 3,
    },
    {
      id: 'videos',
      label: 'Meus Vídeos',
      icon: 'video-camera',
      route: '/videos',
      theme: 'outline',
      title: 'Meus Vídeos - Gerencie seus vídeos',
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: 'setting',
      route: '/settings',
      theme: 'outline',
      title: 'Configurações - Gerencie sua conta',
    },
  ];

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
