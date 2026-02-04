import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  const authServiceMock = { login: jest.fn().mockReturnValue(of(true)) };

  beforeEach(async () => {
    jest.clearAllMocks();
    authServiceMock.login.mockReturnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzCardModule,
        NzIconModule,
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('should validate email', () => {
    const email = component.loginForm.get('email');
    email?.setValue('invalid');
    expect(email?.hasError('email')).toBe(true);
    email?.setValue('user@example.com');
    expect(email?.errors).toBeNull();
  });

  it('should call authService.login and navigate on submit', () => {
    component.loginForm.patchValue({
      email: 'user@example.com',
      password: 'Password1!',
    });
    component.onSubmit();
    expect(authServiceMock.login).toHaveBeenCalledWith(
      'user@example.com',
      'Password1!'
    );
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should not submit when form invalid', () => {
    component.loginForm.patchValue({ email: '', password: '' });
    component.onSubmit();
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });
});
