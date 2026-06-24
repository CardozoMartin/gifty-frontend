import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserAuthStore } from '../../store/userAuthStore';

// Protege rutas que requieren que el usuario cliente esté logueado
const UserProtectedRoute = () => {
  const estaAutenticado = useUserAuthStore((s) => s.estaAutenticado);
  const location = useLocation();

  if (!estaAutenticado) {
    // Guardamos la ruta a la que quería ir para redirigir después del login
    return <Navigate to="/cuenta-mayorista" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default UserProtectedRoute;
