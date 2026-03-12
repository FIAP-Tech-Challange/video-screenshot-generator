import { Component, inject } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NzCardModule, NzAvatarModule, NzIconModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly authService = inject(AuthService);

  get user() {
    return this.authService.getUser();
  }
}
