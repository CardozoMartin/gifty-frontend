import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { loginAdmin } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import logoGifty from '../../img/logo-gifty.png';

interface LoginFormData {
  usuario: string;
  password: string;
}

// Pantalla de login que protege el acceso al panel admin
const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [errorServidor, setErrorServidor] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  // Envía las credenciales, guarda el token y redirige al dashboard
  const onSubmit = async (datos: LoginFormData) => {
    setErrorServidor('');
    try {
      const token = await loginAdmin(datos);
      login(token);
      navigate('/admin', { replace: true });
    } catch (error) {
      setErrorServidor(
        error instanceof Error ? error.message : 'Error al iniciar sesión'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo y título */}
        <div className="text-center mb-8">
          <img src={logoGifty} alt="Gifty" className="h-20 w-auto object-contain mx-auto mb-2" />
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1.5">
            <Lock size={13} className="text-gray-400" />
            Panel de administración
          </p>
        </div>

        {/* Card del formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Campo usuario */}
            <div>
              <label className="block text-sm font-medium text-marino mb-1.5">
                Usuario
              </label>
              <input
                {...register('usuario', { required: 'El usuario es obligatorio' })}
                autoComplete="username"
                autoFocus
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-colors ${
                  errors.usuario
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-gray-200 focus:border-rosa'
                }`}
                placeholder="admin"
              />
              {errors.usuario && (
                <p className="text-red-500 text-xs mt-1">{errors.usuario.message}</p>
              )}
            </div>

            {/* Campo contraseña con toggle de visibilidad */}
            <div>
              <label className="block text-sm font-medium text-marino mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password', { required: 'La contraseña es obligatoria' })}
                  type={mostrarPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`w-full border rounded-lg px-4 py-2.5 pr-10 text-sm outline-none transition-colors ${
                    errors.password
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-gray-200 focus:border-rosa'
                  }`}
                  placeholder="••••••••"
                />
                {/* Botón para mostrar/ocultar la contraseña */}
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Error del servidor (credenciales incorrectas) */}
            {errorServidor && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-600 text-sm text-center">{errorServidor}</p>
              </div>
            )}

            {/* Botón de ingreso */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primario w-full py-2.5 text-sm disabled:opacity-60"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        {/* Link para volver a la tienda */}
        <p className="text-center text-xs text-gray-400 mt-6">
          ¿Sos cliente?{' '}
          <a href="/" className="text-rosa hover:underline">
            Ir a la tienda
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
