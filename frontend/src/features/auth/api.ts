import { api } from '../../lib/api';

export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/login', { email, password });
}

export async function register(name: string, email: string, password: string): Promise<void> {
  await api.post('/api/auth/register', { name, email, password });
}