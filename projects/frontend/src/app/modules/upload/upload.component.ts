import { Component, inject, signal, OnDestroy } from '@angular/core';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';

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

  acceptTypes = '.mp4,.mov,.avi,.mkv,.webm';

  ngOnDestroy(): void {
    const url = this.videoPreview();
    if (url) URL.revokeObjectURL(url);
  }

  uploadProgress = signal(0);
  uploadStatus = signal<'active' | 'success' | 'exception'>('active');
  videoPreview = signal<string | null>(null);
  currentFile = signal<File | null>(null);

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
    this.simulateProgress();
    if (rawFile instanceof File) this.createPreview(rawFile);
    return false; // impede envio automático
  };

  private simulateProgress(): void {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      this.uploadProgress.set(progress);
      if (progress >= 100) {
        clearInterval(interval);
        this.uploadStatus.set('success');
        this.message.success('Upload concluído com sucesso!');
      }
    }, 200);
  }

  private createPreview(file: File): void {
    const url = URL.createObjectURL(file);
    this.videoPreview.set(url);
  }

  handleUpload(): void {
    // Simula mudança do upload (não envia de fato)
  }

  confirmUpload(): void {
    this.message.success('Vídeo confirmado!');
    this.videoPreview.set(null);
    this.currentFile.set(null);
    this.uploadProgress.set(0);
  }

  removePreview(): void {
    const url = this.videoPreview();
    if (url) URL.revokeObjectURL(url);
    this.videoPreview.set(null);
    this.currentFile.set(null);
    this.uploadProgress.set(0);
  }
}
