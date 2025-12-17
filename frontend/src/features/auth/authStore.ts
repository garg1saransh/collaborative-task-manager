const STORAGE_KEY = 'auth';

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

export function saveAuth(token: string, user: AuthUser) {
  const state: AuthState = { token, user };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadAuth(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: null, user: null };
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return { token: null, user: null };
  }
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}