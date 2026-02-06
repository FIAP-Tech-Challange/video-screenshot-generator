import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzIconModule,
    NzProgressModule,
    NzTimelineModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  user = this.authService.getUser();
  userName = this.user?.name || this.user?.email?.split('@')[0] || 'Usuário';

  totalVideos = 12;
  usedSpace = 2.4;
  storageLimit = 10;
  storagePercentage = Math.round((this.usedSpace / this.storageLimit) * 100);

  recentActivities = [
    { action: 'Vídeo "Apresentação.mp4" processado', time: new Date() },
    {
      action: 'Upload concluído: "Demo.mp4"',
      time: new Date(Date.now() - 3600000),
    },
    {
      action: 'Novo vídeo enviado para processamento',
      time: new Date(Date.now() - 7200000),
    },
  ];

  navigateToUpload(): void {
    this.router.navigate(['/upload']);
  }
}
