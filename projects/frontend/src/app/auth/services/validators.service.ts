import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormGroup,
} from '@angular/forms';
import { validateCPF } from '../utils/cpf.validator';
import { validatePassword } from '../utils/password.validator';

/**
 * Custom validator for CPF (Brazilian tax ID)
 */
export function cpfValidator(
  control: AbstractControl
): ValidationErrors | null {
  const cpf = control.value;
  if (!cpf) return null;

  return validateCPF(cpf) ? null : { invalidCPF: true };
}

/**
 * Custom validator for password strength (8+ chars, 1 uppercase, 1 special)
 */
export function passwordStrengthValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.value;
  if (!password) return null;

  return validatePassword(password) ? null : { weakPassword: true };
}

/**
 * Validator to check that password and confirmPassword match (use on FormGroup)
 */
export function confirmPasswordValidator(
  passwordField = 'password',
  confirmField = 'confirmPassword'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup;
    const password = form.get(passwordField)?.value;
    const confirm = form.get(confirmField)?.value;
    if (!password || !confirm) return null;

    return password === confirm ? null : { passwordMismatch: true };
  };
}

/**
 * Validator para o controle confirmPassword: define erro no próprio controle
 * para que nzErrorTip exiba "As senhas devem ser iguais" no campo.
 */
export function confirmPasswordMatchValidator(
  passwordFieldName = 'password'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) return null;
    const password = parent.get(passwordFieldName)?.value;
    const confirm = control.value;
    if (!password || !confirm) return null;
    return password === confirm ? null : { passwordMismatch: true };
  };
}

/**
 * Brazilian phone validator (accepts (XX) XXXXX-XXXX or (XX) XXXX-XXXX)
 */
export function brazilianPhoneValidator(
  control: AbstractControl
): ValidationErrors | null {
  const phone = control.value;
  if (!phone) return null;

  const cleaned = phone.replace(/\D/g, '');
  const valid = cleaned.length === 10 || cleaned.length === 11;
  return valid ? null : { invalidPhone: true };
}

/**
 * Validates that the user entered both first name and last name (at least 2 words)
 */
export function fullNameValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();
  const parts = trimmed.split(/\s+/).filter((p) => p.length > 0);

  return parts.length >= 2 ? null : { fullNameRequired: true };
}
