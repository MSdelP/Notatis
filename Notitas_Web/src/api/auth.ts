// Notitas_Web/src/api/auth.ts
import axios from 'axios';

export interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

/**
 * Registra un nuevo usuario.
 * POST {{baseURL}}/api/auth/register
 */
export const register = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await axios.post<AuthResponse>('/api/auth/register', { email, password });
  return data;
};

/**
 * Inicia sesión con credenciales.
 * POST {{baseURL}}/api/auth/login
 */
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await axios.post<AuthResponse>('/api/auth/login', { email, password });
  return data;
};

/**
 * Solicita un nuevo JWT.
 * GET {{baseURL}}/api/auth/refresh-token
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  const { data } = await axios.get<AuthResponse>('/api/auth/refresh-token');
  return data;
};

/**
 * Cierra la sesión eliminando localmente el token.
 * POST {{baseURL}}/api/auth/logout
 */
export const logout = async (): Promise<void> => {
  await axios.post('/api/auth/logout');
};
