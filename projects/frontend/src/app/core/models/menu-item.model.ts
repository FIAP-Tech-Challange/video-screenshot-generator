export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  theme?: 'fill' | 'outline' | 'twotone';
  badge?: number;
  isActive?: boolean;
  title?: string;
  permissions?: string[];
}

export interface SidebarState {
  isCollapsed: boolean;
  width: number;
  isMobile: boolean;
  isMobileOpen: boolean;
}
