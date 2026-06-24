import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

// Componente que envuelve las rutas del admin
// Si el usuario no está autenticado lo redirige a la página de login
const ProtectedRoute = () => {
  const estaAutenticado = useAuthStore((s) => s.estaAutenticado);

  if (!estaAutenticado) {
    // replace: true para que el botón "atrás" no vuelva a /admin
    return <Navigate to="/admin/login" replace />;
  }

  // Si está autenticado renderizamos la sub-ruta correspondiente
  return <Outlet />;
};

export default ProtectedRoute;
