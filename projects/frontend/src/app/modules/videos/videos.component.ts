import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [
    NzCardModule,
    NzIconModule,
    NzEmptyModule,
    NzButtonModule,
    RouterLink,
  ],
  template: `
    <div class="videos-container">
      <div class="videos-header">
        <h1>Meus Vídeos</h1>
        <p>Gerencie seus vídeos enviados</p>
      </div>
      <nz-card class="videos-card">
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
      </nz-card>
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
    `,
  ],
})
export class VideosComponent {}
