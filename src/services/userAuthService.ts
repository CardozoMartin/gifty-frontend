import api from './api';
import { Usuario } from '../store/userAuthStore';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  empresa?: string;
  telefono?: string;
}

export interface AuthResponse {
  ok: boolean;
  token: string;
  usuario: Usuario;
}

export interface PerfilData {
  nombre: string;
  apellido?: string;
  empresa?: string;
  telefono?: string;
  dni?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
}

export const userAuthService = {
  login: async (datos: LoginData): Promise<AuthResponse> => {
    const res = await api.post('/usuarios/login', datos);
    return res.data;
  },

  getPerfil: async (): Promise<{ ok: boolean; usuario: import('../store/userAuthStore').Usuario }> => {
    const res = await api.get('/usuarios/perfil');
    return res.data;
  },

  updatePerfil: async (datos: PerfilData): Promise<{ ok: boolean; usuario: import('../store/userAuthStore').Usuario }> => {
    const res = await api.put('/usuarios/perfil', datos);
    return res.data;
  },

  register: async (datos: RegisterData): Promise<{ ok: boolean; mensaje: string }> => {
    const res = await api.post('/usuarios/registro', datos);
    return res.data;
  },

  verifyEmail: async (token: string): Promise<{ ok: boolean; mensaje: string }> => {
    const res = await api.get(`/usuarios/verificar/${token}`);
    return res.data;
  },

  forgotPassword: async (email: string): Promise<{ ok: boolean; mensaje: string }> => {
    const res = await api.post('/usuarios/recuperar-password', { email });
    return res.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ ok: boolean; mensaje: string }> => {
    const res = await api.post(`/usuarios/reset-password/${token}`, { password });
    return res.data;
  },
};
