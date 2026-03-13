import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../auth/services/auth.service';
import { VideosService } from '../videos/services/videos.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NzCardModule, NzGridModule, NzIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  readonly videosService = inject(VideosService);

  user = this.authService.getUser();
  userName = this.user?.name || this.user?.email?.split('@')[0] || 'Usuário';

  navigateToVideos(): void {
    this.router.navigate(['/videos']);
  }

  navigateToUpload(): void {
    this.router.navigate(['/upload']);
  }
}
