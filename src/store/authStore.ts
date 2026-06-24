import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Estado global de autenticación del admin
interface AuthStore {
  token: string | null;
  estaAutenticado: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Persistimos el token en localStorage para que la sesión sobreviva al recargar
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      estaAutenticado: false,

      // Guarda el token y marca la sesión como activa
      login: (token: string) => set({ token, estaAutenticado: true }),

      // Borra el token y cierra la sesión
      logout: () => set({ token: null, estaAutenticado: false }),
    }),
    {
      name: 'gifty-admin-auth', // clave en localStorage
    }
  )
);
