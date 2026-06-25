import axios from 'axios';

// Instancia base de Axios con la URL de la API configurada
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de request: agrega el token de admin al header Authorization si existe
// Leemos del localStorage directamente para no depender del store de Zustand en este archivo
api.interceptors.request.use((config) => {
  // Prioridad: admin > usuario
  const adminData = localStorage.getItem('gifty-admin-auth');
  const userData = localStorage.getItem('gifty-user-auth');

  const raw = adminData || userData;
  if (raw) {
    try {
      const { state } = JSON.parse(raw);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch {
      // JSON corrupto, no enviamos header
    }
  }
  return config;
});

// Interceptor de respuesta: extrae los datos o lanza el error con mensaje legible
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const mensaje =
      error.response?.data?.mensaje ||
      error.message ||
      'Error de conexión con el servidor';

    // Si el servidor responde 401, limpiamos la sesión del localStorage
    // Esto cierra la sesión automáticamente si el token expiró o es inválido
    if (error.response?.status === 401) {
      localStorage.removeItem('gifty-admin-auth');
      localStorage.removeItem('gifty-user-auth');
    }

    return Promise.reject(new Error(mensaje));
  }
);

export default api;
