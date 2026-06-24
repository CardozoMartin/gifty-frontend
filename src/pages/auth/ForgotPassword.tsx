import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Gift, CheckCircle2, ArrowLeft } from 'lucide-react';
import { userAuthService } from '../../services/userAuthService';

const ForgotPassword = () => {
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>();

  const onSubmit = async (datos: { email: string }) => {
    setError('');
    try {
      await userAuthService.forgotPassword(datos.email);
      setEnviado(true);
    } catch (e: any) {
      setError(e.message || 'Error al enviar el correo');
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
          <h1 className="text-2xl font-bold text-marino">Recuperar contraseña</h1>
          <p className="text-sm text-gray-500 mt-1">Te enviamos un link para resetearla</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {enviado ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-emerald-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-base font-bold text-marino mb-2">Email enviado</h2>
              <p className="text-sm text-gray-500 mb-6">
                Si <span className="font-medium text-gray-700">{getValues('email')}</span> está
                registrado, vas a recibir un link para resetear tu contraseña.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-rosa hover:underline"
              >
                <ArrowLeft size={14} /> Volver al login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-lg px-4 py-3 mb-5">
                  {error}
                </div>
              )}

              <p className="text-sm text-gray-500 mb-6">
                Ingresá el email de tu cuenta y te enviamos las instrucciones para recuperar tu contraseña.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'El email es obligatorio',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' },
                    })}
                    placeholder="tu@email.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-rosa focus:ring-2 focus:ring-rosa/10 transition-colors"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-60"
                  style={{ background: '#e91e8c' }}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar link de recuperación'}
                </button>
              </form>

              <p className="text-center mt-6">
                <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                  <ArrowLeft size={13} /> Volver al login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
