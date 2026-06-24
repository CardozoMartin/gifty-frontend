import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Gift, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { userAuthService } from '../../services/userAuthService';

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!token) {
      setEstado('error');
      setMensaje('Token inválido o expirado.');
      return;
    }

    userAuthService.verifyEmail(token)
      .then((res) => {
        setMensaje(res.mensaje);
        setEstado('ok');
      })
      .catch((e) => {
        setMensaje(e.message || 'El link expiró o ya fue utilizado.');
        setEstado('error');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#fdf6fb' }}>
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#e91e8c' }}>
            <Gift size={24} color="white" strokeWidth={2} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">

          {estado === 'cargando' && (
            <>
              <Loader2 size={40} className="text-rosa mx-auto mb-4 animate-spin" strokeWidth={1.5} />
              <h2 className="text-lg font-bold text-marino mb-2">Verificando tu cuenta...</h2>
              <p className="text-sm text-gray-500">Por favor esperá un momento.</p>
            </>
          )}

          {estado === 'ok' && (
            <>
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-marino mb-2">¡Cuenta verificada!</h2>
              <p className="text-sm text-gray-500 mb-6">{mensaje || 'Tu cuenta fue activada correctamente.'}</p>
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 text-sm font-semibold text-white rounded-lg"
                style={{ background: '#e91e8c' }}
              >
                Iniciar sesión
              </Link>
            </>
          )}

          {estado === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-red-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-marino mb-2">Link inválido</h2>
              <p className="text-sm text-gray-500 mb-6">{mensaje}</p>
              <div className="flex flex-col gap-3 items-center">
                <Link
                  to="/registro"
                  className="inline-block px-6 py-2.5 text-sm font-semibold text-white rounded-lg"
                  style={{ background: '#e91e8c' }}
                >
                  Volver al registro
                </Link>
                <Link to="/login" className="text-sm text-rosa hover:underline">
                  Ya tengo cuenta, iniciar sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
