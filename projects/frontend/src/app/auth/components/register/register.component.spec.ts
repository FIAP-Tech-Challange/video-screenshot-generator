import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import {
  UserAddOutline,
  CheckCircleFill,
  EyeOutline,
  EyeInvisibleOutline,
} from '@ant-design/icons-angular/icons';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { PasswordStrengthComponent } from '../../../shared/components/password-strength/password-strength.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;
  const authServiceMock = {
    register: jest.fn().mockReturnValue(of({ success: true } as const)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    authServiceMock.register.mockReturnValue(of({ success: true } as const));

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzCardModule,
        NzIconModule,
        PasswordStrengthComponent,
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: NZ_ICONS,
          useValue: [UserAddOutline, CheckCircleFill, EyeOutline, EyeInvisibleOutline],
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.registerForm.valid).toBe(false);
  });

  it('should call authService.register and navigate on submit', () => {
    component.registerForm.patchValue({
      name: 'Maria Santos',
      email: 'user@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });
    component.onSubmit();
    expect(authServiceMock.register).toHaveBeenCalled();
    jest.advanceTimersByTime(2000);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard'], {
      replaceUrl: true,
    });
  });
});
