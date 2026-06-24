import { Navigate, Outlet } from 'react-router-dom';
import { useUserAuthStore } from '../../store/userAuthStore';

// Si el usuario ya está logueado no tiene sentido ver login/registro
const GuestRoute = () => {
  const estaAutenticado = useUserAuthStore((s) => s.estaAutenticado);
  return estaAutenticado ? <Navigate to="/mi-cuenta" replace /> : <Outlet />;
};

export default GuestRoute;
