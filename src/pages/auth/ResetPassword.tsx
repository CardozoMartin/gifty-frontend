import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Gift, CheckCircle2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { userAuthService } from '../../services/userAuthService';

interface FormData {
  password: string;
  confirmar: string;
}

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (datos: FormData) => {
    setError('');
    if (!token) {
      setError('El link es inválido o ya expiró.');
      return;
    }
    try {
      await userAuthService.resetPassword(token, datos.password);
      setExito(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (e: any) {
      setError(e.message || 'El link es inválido o ya expiró.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#fdf6fb' }}>
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#e91e8c' }}>
            <Gift size={24} color="white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-marino">Nueva contraseña</h1>
          <p className="text-sm text-gray-500 mt-1">Ingresá tu nueva contraseña</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {exito ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-emerald-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-base font-bold text-marino mb-2">¡Contraseña actualizada!</h2>
              <p className="text-sm text-gray-500 mb-6">
                Tu contraseña fue cambiada correctamente. Te redirigimos al login...
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-rosa hover:underline"
              >
                <ArrowLeft size={14} /> Ir al login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-lg px-4 py-3 mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={verPass ? 'text' : 'password'}
                      {...register('password', {
                        required: 'La contraseña es obligatoria',
                        minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                      })}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-rosa focus:ring-2 focus:ring-rosa/10 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setVerPass(!verPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {verPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={verConfirmar ? 'text' : 'password'}
                      {...register('confirmar', {
                        required: 'Confirmá tu contraseña',
                        validate: (val) => val === watch('password') || 'Las contraseñas no coinciden',
                      })}
                      placeholder="Repetí la contraseña"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-rosa focus:ring-2 focus:ring-rosa/10 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setVerConfirmar(!verConfirmar)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {verConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmar && <p className="text-red-400 text-xs mt-1">{errors.confirmar.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-60"
                  style={{ background: '#e91e8c' }}
                >
                  {isSubmitting ? 'Guardando...' : 'Cambiar contraseña'}
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

export default ResetPassword;
