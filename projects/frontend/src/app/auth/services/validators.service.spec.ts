import {
  cpfValidator,
  passwordStrengthValidator,
  confirmPasswordValidator,
  brazilianPhoneValidator,
  fullNameValidator,
} from './validators.service';
import { FormGroup, FormControl } from '@angular/forms';

describe('validators.service', () => {
  describe('cpfValidator', () => {
    it('should return null for valid CPF', () => {
      const control = new FormControl('123.456.789-09');
      expect(cpfValidator(control)).toBeNull();
    });

    it('should return invalidCPF for invalid CPF', () => {
      const control = new FormControl('11111111111');
      expect(cpfValidator(control)).toEqual({ invalidCPF: true });
    });

    it('should return null when empty', () => {
      const control = new FormControl('');
      expect(cpfValidator(control)).toBeNull();
    });
  });

  describe('passwordStrengthValidator', () => {
    it('should return null for strong password', () => {
      const control = new FormControl('Abcdefg1!');
      expect(passwordStrengthValidator(control)).toBeNull();
    });

    it('should return weakPassword for weak password', () => {
      const control = new FormControl('abc');
      expect(passwordStrengthValidator(control)).toEqual({
        weakPassword: true,
      });
    });
  });

  describe('confirmPasswordValidator', () => {
    it('should return null when passwords match', () => {
      const form = new FormGroup({
        password: new FormControl('Abcdefg1!'),
        confirmPassword: new FormControl('Abcdefg1!'),
      });
      const fn = confirmPasswordValidator('password', 'confirmPassword');
      expect(fn(form)).toBeNull();
    });

    it('should return passwordMismatch when they do not match', () => {
      const form = new FormGroup({
        password: new FormControl('Abcdefg1!'),
        confirmPassword: new FormControl('OtherPass1!'),
      });
      const fn = confirmPasswordValidator('password', 'confirmPassword');
      expect(fn(form)).toEqual({ passwordMismatch: true });
    });
  });

  describe('brazilianPhoneValidator', () => {
    it('should return null for 10 digits', () => {
      const control = new FormControl('1198765432');
      expect(brazilianPhoneValidator(control)).toBeNull();
    });

    it('should return null for 11 digits', () => {
      const control = new FormControl('11987654321');
      expect(brazilianPhoneValidator(control)).toBeNull();
    });

    it('should return invalidPhone for wrong length', () => {
      const control = new FormControl('123');
      expect(brazilianPhoneValidator(control)).toEqual({ invalidPhone: true });
    });
  });

  describe('fullNameValidator', () => {
    it('should return null for name and surname', () => {
      const control = new FormControl('João Silva');
      expect(fullNameValidator(control)).toBeNull();
    });

    it('should return null for multiple names', () => {
      const control = new FormControl('Maria da Silva Santos');
      expect(fullNameValidator(control)).toBeNull();
    });

    it('should return fullNameRequired for single name', () => {
      const control = new FormControl('João');
      expect(fullNameValidator(control)).toEqual({ fullNameRequired: true });
    });

    it('should return fullNameRequired when empty', () => {
      const control = new FormControl('   ');
      expect(fullNameValidator(control)).toEqual({ fullNameRequired: true });
    });
  });
});
