import { Component, inject, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { VideosService } from '../videos/services/videos.service';

const ACCEPT_VIDEO = '.mp4,.mov,.avi,.mkv,.webm';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [NzUploadModule, NzIconModule, NzProgressModule, FileSizePipe],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent implements OnDestroy {
  private readonly message = inject(NzMessageService);
  private readonly videosService = inject(VideosService);
  private readonly router = inject(Router);

  acceptTypes = '.mp4,.mov,.avi,.mkv,.webm';

  uploadProgress = signal(0);
  uploadStatus = signal<'active' | 'success' | 'exception'>('active');
  videoPreview = signal<string | null>(null);
  currentFile = signal<File | null>(null);
  uploading = signal(false);

  ngOnDestroy(): void {
    const url = this.videoPreview();
    if (url) URL.revokeObjectURL(url);
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    const rawFile = file.originFileObj ?? (file as unknown as File);
    const name = file.name ?? rawFile?.name ?? '';
    const size = file.size ?? rawFile?.size ?? 0;
    const isVideo = ACCEPT_VIDEO.split(',')
      .map((ext) => ext.trim())
      .some((ext) => name.toLowerCase().endsWith(ext));
    if (!isVideo) {
      this.message.error(
        'Apenas vídeos são permitidos (MP4, MOV, AVI, MKV, WebM)'
      );
      return false;
    }
    const isLt100M = size / 1024 / 1024 < 100;
    if (!isLt100M) {
      this.message.error('O arquivo deve ter menos de 100MB');
      return false;
    }
    this.currentFile.set(rawFile instanceof File ? rawFile : null);
    this.uploadProgress.set(0);
    this.uploadStatus.set('active');
    this.uploading.set(false);
    if (rawFile instanceof File) this.createPreview(rawFile);
    return false; // impede envio automático; usamos Confirmar Upload
  };

  confirmUpload(): void {
    const file = this.currentFile();
    if (!file) return;
    if (this.uploading()) return;

    this.uploading.set(true);
    this.uploadProgress.set(0);
    this.uploadStatus.set('active');

    this.videosService.create(file.name).subscribe({
      next: ({ uploadUrl }) => {
        this.videosService.uploadToPresignedUrl(uploadUrl, file).subscribe({
          next: (percent) => this.uploadProgress.set(percent),
          error: (err) => {
            this.uploading.set(false);
            this.uploadStatus.set('exception');
            this.message.error(err?.message ?? 'Falha no envio do vídeo.');
          },
          complete: () => {
            this.uploading.set(false);
            this.uploadStatus.set('success');
            this.message.success('Upload concluído! O processamento foi enfileirado.');
            this.clearAndNavigate();
          },
        });
      },
      error: (err: { status?: number; error?: { message?: string | string[] }; message?: string }) => {
        this.uploading.set(false);
        const raw =
          err?.status === 401
            ? 'Sessão expirada. Faça login novamente.'
            : err?.error?.message ?? err?.message ?? 'Não foi possível iniciar o upload. Tente novamente.';
        const msg = Array.isArray(raw) ? raw[0] : raw;
        this.message.error(msg);
        console.error('Upload create error:', err);
      },
    });
  }

  private clearAndNavigate(): void {
    const url = this.videoPreview();
    if (url) URL.revokeObjectURL(url);
    this.videoPreview.set(null);
    this.currentFile.set(null);
    this.uploadProgress.set(0);
    this.router.navigate(['/videos']);
  }

  private createPreview(file: File): void {
    const url = URL.createObjectURL(file);
    this.videoPreview.set(url);
  }

  removePreview(): void {
    const url = this.videoPreview();
    if (url) URL.revokeObjectURL(url);
    this.videoPreview.set(null);
    this.currentFile.set(null);
    this.uploadProgress.set(0);
  }
}
