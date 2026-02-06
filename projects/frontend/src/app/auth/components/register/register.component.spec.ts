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
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { PasswordStrengthComponent } from '../../../shared/components/password-strength/password-strength.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;
  const authServiceMock = { register: jest.fn().mockReturnValue(of(true)) };

  beforeEach(async () => {
    jest.clearAllMocks();
    authServiceMock.register.mockReturnValue(of(true));

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

  it('should format CPF on input', () => {
    const input = document.createElement('input');
    input.value = '12345678909';
    component.onCPFInput({ target: input } as unknown as Event);
    expect(component.registerForm.get('cpf')?.value).toBe('123.456.789-09');
  });

  it('should format phone on input', () => {
    const input = document.createElement('input');
    input.value = '11987654321';
    component.onPhoneInput({ target: input } as unknown as Event);
    expect(component.registerForm.get('phone')?.value).toBe('(11) 98765-4321');
  });

  it('should call authService.register and navigate on submit', () => {
    component.registerForm.patchValue({
      name: 'Maria Santos',
      email: 'user@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
      phone: '(11) 98765-4321',
      cpf: '123.456.789-09',
    });
    component.onSubmit();
    expect(authServiceMock.register).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard'], {
      replaceUrl: true,
    });
  });
});
