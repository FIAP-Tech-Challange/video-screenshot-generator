/**
 * Validates a Brazilian CPF number
 * @param cpf - CPF to be validated (can contain dots and dash)
 * @returns boolean indicating if CPF is valid
 */
export function validateCPF(cpf: string | number): boolean {
  let sum = 0;
  let remainder: number;

  const strCPF = String(cpf).replace(/[^\d]/g, '');

  if (strCPF.length !== 11) {
    return false;
  }

  const invalidCPFs = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
  ];

  if (invalidCPFs.includes(strCPF)) {
    return false;
  }

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(strCPF.substring(i - 1, i), 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(strCPF.substring(9, 10), 10)) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(strCPF.substring(i - 1, i), 10) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(strCPF.substring(10, 11), 10)) return false;

  return true;
}

/**
 * Formats a CPF (XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/[^\d]/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Removes CPF formatting
 */
export function unformatCPF(cpf: string): string {
  return cpf.replace(/[^\d]/g, '');
}
