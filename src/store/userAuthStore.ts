import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  verificado: boolean;
}

interface UserAuthStore {
  token: string | null;
  usuario: Usuario | null;
  estaAutenticado: boolean;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  setUsuario: (usuario: Usuario) => void;
}

export const useUserAuthStore = create<UserAuthStore>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      estaAutenticado: false,
      login: (token, usuario) => set({ token, usuario, estaAutenticado: true }),
      logout: () => set({ token: null, usuario: null, estaAutenticado: false }),
      setUsuario: (usuario) => set({ usuario }),
    }),
    { name: 'gifty-user-auth' }
  )
);
