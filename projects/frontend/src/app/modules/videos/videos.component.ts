import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { RouterLink } from '@angular/router';
import { VideosService } from './services/videos.service';
import type { VideoJob, VideoJobStatus } from './models/video-job.model';

const STATUS_LABELS: Record<VideoJobStatus, string> = {
  queued: 'Na fila',
  processing: 'Processando',
  success: 'Concluído',
  error: 'Erro',
};

const STATUS_COLORS: Record<VideoJobStatus, string> = {
  queued: 'default',
  processing: 'processing',
  success: 'success',
  error: 'error',
};

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [
    DatePipe,
    NzCardModule,
    NzIconModule,
    NzEmptyModule,
    NzButtonModule,
    NzListModule,
    NzTagModule,
    NzSpinModule,
    RouterLink,
  ],
  template: `
    <div class="videos-container">
      <div class="videos-header">
        <h1>Meus Vídeos</h1>
        <p>Gerencie seus vídeos enviados</p>
      </div>
      <nz-spin [nzSpinning]="loading()">
        <nz-card class="videos-card">
          @if (jobs().length > 0) {
            <nz-list nzBordered>
              @for (job of jobs(); track job.id) {
                <nz-list-item>
                  <nz-list-item-meta
                    [nzAvatar]="avatarTpl"
                    [nzTitle]="job.fileName"
                    [nzDescription]="descTpl"
                  >
                    <ng-template #avatarTpl>
                      <span
                        nz-icon
                        [nzType]="getStatusIcon(job.status)"
                        class="list-icon"
                      ></span>
                    </ng-template>
                    <ng-template #descTpl>
                      <span class="list-meta">
                        <nz-tag [nzColor]="getStatusColor(job.status)">
                          {{ getStatusLabel(job.status) }}
                        </nz-tag>
                        <span class="list-date">
                          Enviado em {{ job.createdAt | date : 'dd/MM/yyyy HH:mm' }}
                        </span>
                        @if (job.errorReason) {
                          <span class="list-error">{{ job.errorReason }}</span>
                        }
                      </span>
                    </ng-template>
                  </nz-list-item-meta>
                </nz-list-item>
              }
            </nz-list>
          } @else if (!loading()) {
            <nz-empty
              nzNotFoundContent="Nenhum vídeo ainda"
              [nzNotFoundFooter]="footerTpl"
            >
              <ng-template #footerTpl>
                <a routerLink="/upload" nz-button nzType="primary">
                  <span nz-icon nzType="cloud-upload"></span>
                  Enviar primeiro vídeo
                </a>
              </ng-template>
            </nz-empty>
          }
        </nz-card>
      </nz-spin>
    </div>
  `,
  styles: [
    `
      .videos-container {
        padding: 0;
      }
      .videos-header {
        margin-bottom: 24px;
      }
      .videos-header h1 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 700;
      }
      .videos-header p {
        margin: 0;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.45);
      }
      .videos-card {
        border-radius: 16px;
      }
      .list-icon {
        font-size: 24px;
        color: rgba(0, 0, 0, 0.45);
      }
      .list-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }
      .list-date {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
      }
      .list-error {
        font-size: 12px;
        color: #ff4d4f;
      }
    `,
  ],
})
export class VideosComponent implements OnInit {
  private readonly videosService = inject(VideosService);

  loading = signal(true);
  jobs = signal<VideoJob[]>([]);

  ngOnInit(): void {
    this.loadJobs();
  }

  private loadJobs(): void {
    this.loading.set(true);
    this.videosService.list().subscribe({
      next: (data) => {
        this.jobs.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getStatusLabel(status: VideoJobStatus): string {
    return STATUS_LABELS[status] ?? status;
  }

  getStatusColor(status: VideoJobStatus): string {
    return STATUS_COLORS[status] ?? 'default';
  }

  getStatusIcon(status: VideoJobStatus): string {
    switch (status) {
      case 'queued':
        return 'clock-circle';
      case 'processing':
        return 'loading';
      case 'success':
        return 'check-circle';
      case 'error':
        return 'close-circle';
      default:
        return 'file';
    }
  }
}
