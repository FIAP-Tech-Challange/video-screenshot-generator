import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get should call GET with correct URL', () => {
    service.get<{ id: string }>('/users').subscribe((r) => {
      expect(r).toEqual({ id: '1' });
    });
    const req = httpMock.expectOne((r) => r.url.includes('/api/users'));
    expect(req.request.method).toBe('GET');
    req.flush({ id: '1' });
  });

  it('get should append params when provided', () => {
    const params = new HttpParams().set('page', '1').set('size', '10');
    service.get('/items', params).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/api/items'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('10');
    req.flush([]);
  });

  it('post should call POST with body', () => {
    const body = { name: 'Test' };
    service.post<{ id: string }>('/items', body).subscribe((r) => {
      expect(r).toEqual({ id: '123' });
    });
    const req = httpMock.expectOne((r) => r.url.includes('/api/items'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: '123' });
  });

  it('put should call PUT with body', () => {
    const body = { name: 'Updated' };
    service.put<{ id: string }>('/items/1', body).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/api/items/1'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({ id: '1' });
  });

  it('delete should call DELETE', () => {
    service.delete('/items/1').subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/api/items/1'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
