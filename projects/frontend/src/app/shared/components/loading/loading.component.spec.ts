import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default size "default"', () => {
    expect(component.size).toBe('default');
  });

  it('should have default tip "Carregando..."', () => {
    expect(component.tip).toBe('Carregando...');
  });

  it('should accept custom size and tip', () => {
    component.size = 'large';
    component.tip = 'Aguarde...';
    fixture.detectChanges();
    expect(component.size).toBe('large');
    expect(component.tip).toBe('Aguarde...');
  });

  it('should render nz-spin', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nz-spin')).toBeTruthy();
  });
});
