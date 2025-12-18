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

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/login', { email, password });
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/register', {
    email,
    password,
    name,
  });
}