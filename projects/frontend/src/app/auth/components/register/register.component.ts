import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../services/auth.service';
import {
  cpfValidator,
  passwordStrengthValidator,
  confirmPasswordMatchValidator,
  brazilianPhoneValidator,
  fullNameValidator,
} from '../../services/validators.service';
import { formatCPF } from '../../utils/cpf.validator';
import { PasswordStrengthComponent } from '../../../shared/components/password-strength/password-strength.component';

const PHONE_MAX_DIGITS = 11;
const CPF_MAX_DIGITS = 11;
const PASSWORD_MAX_LENGTH = 20;

function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, PHONE_MAX_DIGITS);
  if (cleaned.length <= 2) {
    return cleaned.replace(/(\d{0,2})/, '($1');
  }
  if (cleaned.length <= 7) {
    return cleaned.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    PasswordStrengthComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly registerForm: FormGroup;

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  constructor() {
    this.registerForm = this.fb.group(
      {
        name: [
          '',
          {
            validators: [Validators.required, fullNameValidator],
            updateOn: 'blur',
          },
        ],
        email: [
          '',
          {
            validators: [Validators.required, Validators.email],
            updateOn: 'blur',
          },
        ],
        password: [
          '',
          {
            validators: [
              Validators.required,
              Validators.minLength(8),
              Validators.maxLength(PASSWORD_MAX_LENGTH),
              passwordStrengthValidator,
            ],
            updateOn: 'change',
          },
        ],
        confirmPassword: [
          '',
          {
            validators: [
              Validators.required,
              Validators.maxLength(PASSWORD_MAX_LENGTH),
              confirmPasswordMatchValidator('password'),
            ],
            updateOn: 'change',
          },
        ],
        phone: [
          '',
          {
            validators: [Validators.required, brazilianPhoneValidator],
            updateOn: 'blur',
          },
        ],
        cpf: [
          '',
          {
            validators: [Validators.required, cpfValidator],
            updateOn: 'blur',
          },
        ],
      },
      { updateOn: 'blur' }
    );

    // Revalidar confirmPassword quando a senha mudar para exibir/ocultar o erro
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  onCPFInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, CPF_MAX_DIGITS);
    const formatted = formatCPF(digits);
    this.registerForm.patchValue({ cpf: formatted }, { emitEvent: false });
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatPhone(input.value);
    this.registerForm.patchValue({ phone: formatted }, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading.set(true);
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: () => this.loading.set(false),
    });
  }
}
