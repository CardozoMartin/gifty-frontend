import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Gift } from 'lucide-react';
import { userAuthService, LoginData } from '../../services/userAuthService';
import { useUserAuthStore } from '../../store/userAuthStore';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useUserAuthStore((s) => s.login);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/cuenta';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>();

  const onSubmit = async (datos: LoginData) => {
    setError('');
    try {
      const res = await userAuthService.login(datos);
      login(res.token, res.usuario);
      navigate(from, { replace: true });
    } catch (e: any) {
      setError(e.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#fdf6fb' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#e91e8c' }}>
            <Gift size={24} color="white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-marino">Bienvenida de nuevo</h1>
          <p className="text-sm text-gray-500 mt-1">Ingresá a tu cuenta mayorista</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Error global */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                {...register('email', { required: 'El email es obligatorio' })}
                placeholder="tu@email.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-rosa focus:ring-2 focus:ring-rosa/10 transition-colors"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password', { required: 'La contraseña es obligatoria' })}
                  type={mostrarPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-11 text-sm outline-none focus:border-rosa focus:ring-2 focus:ring-rosa/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {mostrarPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-end">
              <Link to="/recuperar-password" className="text-xs text-rosa hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-60"
              style={{ background: '#e91e8c' }}
            >
              {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tenés cuenta?{' '}
            <Link to="/registro" className="text-rosa font-medium hover:underline">
              Registrate
            </Link>
          </p>
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">
            ← Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
