import { Component, Input } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [NzSpinModule],
  template: `
    <div class="loading-container">
      <nz-spin [nzSize]="size" [nzTip]="tip"></nz-spin>
    </div>
  `,
  styles: [
    `
      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
      }
    `,
  ],
})
export class LoadingComponent {
  @Input() size: 'small' | 'default' | 'large' = 'default';
  @Input() tip = 'Carregando...';
}
