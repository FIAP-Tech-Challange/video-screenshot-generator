import { validatePassword, getPasswordStrength } from './password.validator';

describe('password.validator', () => {
  describe('validatePassword', () => {
    it('should return true for valid password (8+ chars, upper, special)', () => {
      expect(validatePassword('Abcdefg1!')).toBe(true);
      expect(validatePassword('MyP@ssw0rd')).toBe(true);
    });

    it('should return false when length < 8', () => {
      expect(validatePassword('Abc1!')).toBe(false);
    });

    it('should return false when no uppercase', () => {
      expect(validatePassword('abcdefg1!')).toBe(false);
    });

    it('should return false when no special char', () => {
      expect(validatePassword('Abcdefg12')).toBe(false);
    });
  });

  describe('getPasswordStrength', () => {
    it('should return 0 for empty', () => {
      expect(getPasswordStrength('')).toBe(0);
    });

    it('should return 1 for length only', () => {
      expect(getPasswordStrength('aaaaaaaa')).toBe(1);
    });

    it('should return 4 for strong password', () => {
      expect(getPasswordStrength('Abcdefg1!')).toBe(4);
    });
  });
});
