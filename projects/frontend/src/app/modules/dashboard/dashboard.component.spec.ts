import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../auth/services/auth.service';
import { VideosService } from '../videos/services/videos.service';
import { signal } from '@angular/core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  const routerMock = { navigate: jest.fn() };
  const authServiceMock = {
    getUser: jest.fn().mockReturnValue({ name: 'João', email: 'joao@test.com' }),
  };
  const videosServiceMock = {
    totalCount: signal(5),
    completedCount: signal(3),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: VideosService, useValue: videosServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display userName from user', () => {
    expect(component.userName).toBe('João');
  });

  it('should fallback to email prefix when no name', () => {
    authServiceMock.getUser.mockReturnValue({ email: 'maria@test.com' });
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.userName).toBe('maria');
  });

  it('navigateToVideos should navigate to /videos', () => {
    component.navigateToVideos();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/videos']);
  });

  it('navigateToUpload should navigate to /upload', () => {
    component.navigateToUpload();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/upload']);
  });
});
