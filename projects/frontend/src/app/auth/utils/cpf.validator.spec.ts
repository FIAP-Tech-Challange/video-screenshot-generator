import { validateCPF, formatCPF, unformatCPF } from './cpf.validator';

describe('cpf.validator', () => {
  describe('validateCPF', () => {
    it('should return true for valid CPF', () => {
      expect(validateCPF('123.456.789-09')).toBe(true);
      expect(validateCPF('12345678909')).toBe(true);
    });

    it('should return false for invalid length', () => {
      expect(validateCPF('123')).toBe(false);
      expect(validateCPF('123456789012')).toBe(false);
    });

    it('should return false for known invalid sequences', () => {
      expect(validateCPF('00000000000')).toBe(false);
      expect(validateCPF('11111111111')).toBe(false);
      expect(validateCPF('99999999999')).toBe(false);
    });

    it('should return false for invalid check digits', () => {
      expect(validateCPF('12345678900')).toBe(false);
    });
  });

  describe('formatCPF', () => {
    it('should format 11 digits to XXX.XXX.XXX-XX', () => {
      expect(formatCPF('12345678909')).toBe('123.456.789-09');
    });

    it('should return original if not 11 digits', () => {
      expect(formatCPF('123')).toBe('123');
      expect(formatCPF('1234567890')).toBe('1234567890');
    });
  });

  describe('unformatCPF', () => {
    it('should remove dots and dash', () => {
      expect(unformatCPF('123.456.789-09')).toBe('12345678909');
    });
  });
});
