import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordStrengthComponent } from './password-strength.component';

describe('PasswordStrengthComponent', () => {
  let component: PasswordStrengthComponent;
  let fixture: ComponentFixture<PasswordStrengthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordStrengthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordStrengthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show strength 0 for empty password', () => {
    component.password = '';
    expect(component.strength).toBe(0);
    expect(component.strengthLabel).toBe('');
  });

  it('should show strength 4 for strong password', () => {
    component.password = 'Abcdefg1!';
    expect(component.strength).toBe(4);
    expect(component.strengthLabel).toBe('Forte');
  });

  it('should show strength 1 for weak password', () => {
    component.password = 'aaaaaaaa';
    expect(component.strength).toBe(1);
    expect(component.strengthLabel).toBe('Fraca');
  });
});
