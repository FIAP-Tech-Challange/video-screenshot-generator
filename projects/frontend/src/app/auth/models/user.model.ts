export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUser {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  cpf: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  cpf?: string;
  role?: 'admin' | 'user';
}
