export interface LoginCredentials {
  email: string;
  password: string;
}

/** Dados enviados à API de cadastro (confirmPassword só no frontend) */
export interface RegisterUser {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  cpf?: string;
  role?: 'admin' | 'user';
}
