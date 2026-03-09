import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { VideoJob } from '../models/video-job.model';

export interface CreateJobResponse {
  job: VideoJob;
  uploadUrl: string;
}

export interface DownloadScreenshotsResponse {
  downloadUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class VideosService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  /** Quantidade de vídeos com status concluído (success). Atualizado por refreshCompletedCount(). */
  readonly completedCount = signal(0);

  /** Total de vídeos enviados (jobs). Atualizado junto com completedCount. */
  readonly totalCount = signal(0);

  /** Atualiza completedCount e totalCount a partir da lista de jobs. Chamar ao carregar o layout ou após ações. */
  refreshCompletedCount(): void {
    this.list()
      .pipe(
        tap((jobs) => this.setCountsFromJobs(jobs))
      )
      .subscribe();
  }

  /** Atualiza os signals a partir de uma lista já carregada (evita nova requisição). */
  setCountsFromJobs(jobs: VideoJob[]): void {
    this.completedCount.set(jobs.filter((j) => j.status === 'success').length);
    this.totalCount.set(jobs.length);
  }

  list(): Observable<VideoJob[]> {
    return this.api.get<VideoJob[]>('/video-processing-job');
  }

  /** Cria um job e retorna a URL presigned para upload do vídeo. */
  create(fileName: string): Observable<CreateJobResponse> {
    return this.api.post<CreateJobResponse>('/video-processing-job', {
      fileName,
    });
  }

  /** Retorna URL presigned para download do ZIP de screenshots (job deve estar em success). */
  getScreenshotsDownloadUrl(jobId: string): Observable<DownloadScreenshotsResponse> {
    return this.api.get<DownloadScreenshotsResponse>(
      `/video-processing-job/${jobId}/screenshots`
    );
  }

  /**
   * Envia o arquivo para a URL presigned (MinIO).
   * Emite progresso 0–100 e completa quando terminar.
   */
  uploadToPresignedUrl(uploadUrl: string, file: File): Observable<number> {
    return new Observable((subscriber) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          subscriber.next(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          subscriber.next(100);
          subscriber.complete();
        } else {
          subscriber.error(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        subscriber.error(new Error('Upload failed'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.send(file);
    });
  }
}
