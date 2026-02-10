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
  passwordStrengthValidator,
  confirmPasswordMatchValidator,
  fullNameValidator,
} from '../../services/validators.service';
import { PasswordStrengthComponent } from '../../../shared/components/password-strength/password-strength.component';

const PASSWORD_MAX_LENGTH = 20;

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
  readonly errorMessage = signal<string | null>(null);
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
      },
      { updateOn: 'blur' }
    );

    // Revalidar confirmPassword quando a senha mudar para exibir/ocultar o erro
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.errorMessage.set(null);
    this.loading.set(true);
    this.authService.register(this.registerForm.value).subscribe({
      next: (result) => {
        this.loading.set(false);
        if (result.success) {
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        } else {
          this.errorMessage.set(result.message);
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Erro ao conectar. Tente novamente.');
      },
    });
  }
}
