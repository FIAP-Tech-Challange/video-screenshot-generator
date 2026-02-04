import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { AuthService } from '../../auth/services/auth.service';
import {
  cpfValidator,
  brazilianPhoneValidator,
} from '../../auth/services/validators.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAvatarModule,
    NzIconModule,
    NzSwitchModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  user = this.authService.getUser();
  profileForm: FormGroup;
  twoFactorEnabled = false;

  constructor() {
    const u = this.authService.getUser();
    this.profileForm = this.fb.group({
      name: [u?.name ?? '', [Validators.required]],
      email: [u?.email ?? '', [Validators.required, Validators.email]],
      phone: ['', [brazilianPhoneValidator]],
      cpf: ['', [cpfValidator]],
    });
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      console.log('Perfil salvo:', this.profileForm.value);
    }
  }

  resetForm(): void {
    const u = this.authService.getUser();
    this.profileForm.reset({
      name: u?.name ?? '',
      email: u?.email ?? '',
      phone: '',
      cpf: '',
    });
  }
}
