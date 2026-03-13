import { Component, Input } from '@angular/core';
import { getPasswordStrength } from '../../../auth/utils/password.validator';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  template: `
    <div
      class="password-strength"
      role="progressbar"
      [attr.aria-valuenow]="strength"
      aria-valuemin="0"
      aria-valuemax="4"
      aria-label="Força da senha"
    >
      <div class="strength-bars">
        @for (i of [1,2,3,4]; track i) {
        <div
          class="bar"
          [class.active]="i <= strength"
          [class.weak]="strength === 1"
          [class.fair]="strength === 2"
          [class.good]="strength === 3"
          [class.strong]="strength === 4"
        ></div>
        }
      </div>
      <span class="strength-label">{{ strengthLabel || 'Digite para ver a força' }}</span>
    </div>
  `,
  styles: [
    `
      .password-strength {
        margin-top: 8px;
      }
      .strength-bars {
        display: flex;
        gap: 4px;
        margin-bottom: 4px;
      }
      .bar {
        flex: 1;
        height: 4px;
        border-radius: 2px;
        background: #f0f0f0;
        transition: background 0.2s;
      }
      .bar.active.weak {
        background: #ff4d4f;
      }
      .bar.active.fair {
        background: #faad14;
      }
      .bar.active.good {
        background: #1890ff;
      }
      .bar.active.strong {
        background: #52c41a;
      }
      .strength-label {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
      }
    `,
  ],
})
export class PasswordStrengthComponent {
  @Input() password = '';

  get strength(): number {
    return getPasswordStrength(this.password);
  }

  get strengthLabel(): string {
    const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
    return labels[this.strength];
  }
}
