import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { VideoJob } from '../models/video-job.model';

@Injectable({
  providedIn: 'root',
})
export class VideosService {
  private readonly api = inject(ApiService);

  list(): Observable<VideoJob[]> {
    return this.api.get<VideoJob[]>('/video-processing-job');
  }
}
