import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Gift, CheckCircle2 } from 'lucide-react';
import { userAuthService, RegisterData } from '../../services/userAuthService';

const Register = () => {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData & { confirmarPassword: string }>();

  const onSubmit = async (datos: RegisterData & { confirmarPassword: string }) => {
    setError('');
    try {
      const { confirmarPassword: _, ...payload } = datos;
      await userAuthService.register(payload);
      setEnviado(true);
    } catch (e: any) {
      setError(e.message || 'Error al registrarse');
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#fdf6fb' }}>
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-marino mb-2">¡Revisá tu email!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Te enviamos un link de verificación. Hacé click en el link para activar tu cuenta.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 text-sm font-semibold text-white rounded-lg"
              style={{ background: '#e91e8c' }}
            >
              Ir al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-rosa focus:ring-2 focus:ring-rosa/10 transition-colors';
  const labelCls = 'block text-sm font-medium text-gray-600 mb-1.5';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#fdf6fb' }}>
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#e91e8c' }}>
            <Gift size={24} color="white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-marino">Crear cuenta mayorista</h1>
          <p className="text-sm text-gray-500 mt-1">Completá tus datos para registrarte</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label className={labelCls}>
                Nombre completo <span className="text-rosa">*</span>
              </label>
              <input
                {...register('nombre', { required: 'El nombre es obligatorio' })}
                placeholder="Ej: María González"
                className={inputCls}
              />
              {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre.message}</p>}
            </div>

            <div>
              <label className={labelCls}>
                Correo electrónico <span className="text-rosa">*</span>
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'El email es obligatorio',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' },
                })}
                placeholder="tu@email.com"
                className={inputCls}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Contraseña <span className="text-rosa">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'La contraseña es obligatoria',
                      minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                    })}
                    type={mostrarPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className={labelCls}>
                  Confirmar contraseña <span className="text-rosa">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('confirmarPassword', {
                      required: 'Confirmá tu contraseña',
                      validate: (v) => v === watch('password') || 'Las contraseñas no coinciden',
                    })}
                    type={mostrarConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirm(!mostrarConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {mostrarConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmarPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.confirmarPassword.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Empresa / Negocio</label>
                <input
                  {...register('empresa')}
                  placeholder="Ej: Distribuidora Sol"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>WhatsApp / Teléfono</label>
                <input
                  {...register('telefono')}
                  placeholder="Ej: 11 1234-5678"
                  className={inputCls}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-60 mt-2"
              style={{ background: '#e91e8c' }}
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-rosa font-medium hover:underline">
              Iniciar sesión
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

export default Register;
