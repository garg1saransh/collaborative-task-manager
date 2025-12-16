const STORAGE_KEY = 'auth';

export type AuthState = {
  token: string | null;
};

export function saveAuth(token: string) {
  const state: AuthState = { token };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadAuth(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: null };
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return { token: null };
  }
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}