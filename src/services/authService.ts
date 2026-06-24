import api from './api';

interface LoginInput {
  usuario: string;
  password: string;
}

interface LoginResponse {
  ok: boolean;
  token: string;
}

// Envía las credenciales al servidor y devuelve el token si son correctas
export const loginAdmin = async (datos: LoginInput): Promise<string> => {
  const respuesta = await api.post<LoginResponse>('/auth/login', datos);
  return respuesta.data.token;
};

// Verifica con el servidor si el token guardado sigue siendo válido
export const verifyToken = async (): Promise<boolean> => {
  try {
    await api.post('/auth/verify');
    return true;
  } catch {
    return false;
  }
};
