import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { pt_BR, provideNzI18n } from 'ng-zorro-antd/i18n';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { registerLocaleData } from '@angular/common';
import pt from '@angular/common/locales/pt';

import {
  DashboardOutline,
  CloudUploadOutline,
  VideoCameraOutline,
  FolderOpenOutline,
  LineChartOutline,
  SettingOutline,
  VideoCameraFill,
  MenuUnfoldOutline,
  MenuFoldOutline,
  BellOutline,
  UserOutline,
  LogoutOutline,
  LeftOutline,
  RightOutline,
  EyeOutline,
  EyeInvisibleOutline,
  DownloadOutline,
  LoadingOutline,
} from '@ant-design/icons-angular/icons';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { unauthorizedInterceptor } from './core/interceptors/unauthorized.interceptor';

registerLocaleData(pt);

const icons = [
  DashboardOutline,
  CloudUploadOutline,
  VideoCameraOutline,
  FolderOpenOutline,
  LineChartOutline,
  SettingOutline,
  VideoCameraFill,
  MenuUnfoldOutline,
  MenuFoldOutline,
  BellOutline,
  UserOutline,
  LogoutOutline,
  LeftOutline,
  RightOutline,
  EyeOutline,
  EyeInvisibleOutline,
  DownloadOutline,
  LoadingOutline,
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        httpErrorInterceptor,
        unauthorizedInterceptor,
      ])
    ),
    provideNzI18n(pt_BR),
    { provide: NZ_ICONS, useValue: icons },
  ],
};
