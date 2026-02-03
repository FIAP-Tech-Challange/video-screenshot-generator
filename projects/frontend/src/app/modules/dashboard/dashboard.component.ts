import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NzCardModule, NzStatisticModule, NzGridModule],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

      <div nz-row [nzGutter]="16">
        <div nz-col [nzSpan]="6">
          <nz-card>
            <nz-statistic
              [nzValue]="1128"
              nzTitle="Total de Vídeos"
            ></nz-statistic>
          </nz-card>
        </div>

        <div nz-col [nzSpan]="6">
          <nz-card>
            <nz-statistic
              [nzValue]="5634"
              nzTitle="Screenshots Gerados"
            ></nz-statistic>
          </nz-card>
        </div>

        <div nz-col [nzSpan]="6">
          <nz-card>
            <nz-statistic
              [nzValue]="93"
              [nzSuffix]="'%'"
              nzTitle="Taxa de Sucesso"
            ></nz-statistic>
          </nz-card>
        </div>

        <div nz-col [nzSpan]="6">
          <nz-card>
            <nz-statistic [nzValue]="234" nzTitle="Processando"></nz-statistic>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        h1 {
          margin-bottom: 24px;
        }
      }
    `,
  ],
})
export class DashboardComponent {}
