import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { VideosService } from './videos.service';
import type { VideoJob } from '../models/video-job.model';

describe('VideosService', () => {
  let service: VideosService;
  let httpMock: HttpTestingController;

  const mockJobs: VideoJob[] = [
    {
      id: '1',
      userId: 'u1',
      fileName: 'a.mp4',
      status: 'success',
      errorReason: null,
      createdAt: '2024-01-01',
      processedAt: '2024-01-02',
    },
    {
      id: '2',
      userId: 'u1',
      fileName: 'b.mp4',
      status: 'processing',
      errorReason: null,
      createdAt: '2024-01-01',
      processedAt: null,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VideosService],
    });
    service = TestBed.inject(VideosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('list should return jobs from API', (done) => {
    service.list().subscribe((jobs) => {
      expect(jobs).toEqual(mockJobs);
      done();
    });
    const req = httpMock.expectOne((r) =>
      r.url.includes('/video-processing-job')
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockJobs);
  });

  it('create should POST and return job + uploadUrl', (done) => {
    const resp = {
      job: mockJobs[0],
      uploadUrl: 'https://minio.example.com/upload',
    };
    service.create('video.mp4').subscribe((r) => {
      expect(r.job).toEqual(mockJobs[0]);
      expect(r.uploadUrl).toBe(resp.uploadUrl);
      done();
    });
    const req = httpMock.expectOne((r) =>
      r.url.includes('/video-processing-job')
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ fileName: 'video.mp4' });
    req.flush(resp);
  });

  it('getScreenshotsDownloadUrl should return download URL', (done) => {
    service.getScreenshotsDownloadUrl('job-1').subscribe((r) => {
      expect(r.downloadUrl).toBe('https://minio.example.com/download');
      done();
    });
    const req = httpMock.expectOne((r) =>
      r.url.includes('/video-processing-job/job-1/screenshots')
    );
    expect(req.request.method).toBe('GET');
    req.flush({ downloadUrl: 'https://minio.example.com/download' });
  });

  it('setCountsFromJobs should update completedCount and totalCount', () => {
    service.setCountsFromJobs(mockJobs);
    expect(service.completedCount()).toBe(1);
    expect(service.totalCount()).toBe(2);
  });

  it('refreshCompletedCount should fetch list and update counts', (done) => {
    service.refreshCompletedCount();
    const req = httpMock.expectOne((r) =>
      r.url.includes('/video-processing-job')
    );
    req.flush(mockJobs);
    // subscribe triggers the tap, so we need to wait a tick
    setTimeout(() => {
      expect(service.completedCount()).toBe(1);
      expect(service.totalCount()).toBe(2);
      done();
    }, 0);
  });
});
