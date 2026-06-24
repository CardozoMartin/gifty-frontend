import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { userAuthService, LoginData, RegisterData } from '../services/userAuthService';
import { useUserAuthStore } from '../store/userAuthStore';

// ── Tipos locales ─────────────────────────────────────────────────────────────
interface RegistroForm extends RegisterData {
  confirmarPassword: string;
}

type EstadoForm = 'idle' | 'cargando' | 'ok' | 'error';

// ── Componente de alerta ──────────────────────────────────────────────────────
const Alerta = ({ tipo, mensaje }: { tipo: 'ok' | 'error'; mensaje: string }) => (
  <div
    className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm mb-5 ${
      tipo === 'ok'
        ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
        : 'bg-red-50 border border-red-100 text-red-600'
    }`}
  >
    {tipo === 'ok'
      ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
      : <AlertCircle size={16} className="shrink-0 mt-0.5" />
    }
    <span>{mensaje}</span>
  </div>
);

// ── Formulario Login ──────────────────────────────────────────────────────────
const FormLogin = () => {
  const login = useUserAuthStore((s) => s.login);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [estado, setEstado] = useState<EstadoForm>('idle');
  const [mensaje, setMensaje] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();

  const onSubmit = async (datos: LoginData) => {
    setEstado('cargando');
    setMensaje('');
    try {
      const res = await userAuthService.login(datos);
      login(res.token, res.usuario);
      setEstado('ok');
      setMensaje(`¡Bienvenida, ${res.usuario.nombre}! Sesión iniciada correctamente.`);
    } catch (e: any) {
      setEstado('error');
      setMensaje(e.message || 'Error al iniciar sesión');
    }
  };

  const cargando = estado === 'cargando';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
      <h2 className="text-lg font-bold text-marino mb-1">Iniciar sesión</h2>
      <p className="text-sm text-gray-500 mb-6">Accedé a tu cuenta mayorista</p>

      {estado === 'ok' && <Alerta tipo="ok" mensaje={mensaje} />}
      {estado === 'error' && <Alerta tipo="error" mensaje={mensaje} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Correo electrónico</label>
          <input
            type="email"
            {...register('email', { required: 'El email es obligatorio' })}
            placeholder="tu@email.com"
            disabled={cargando}
            className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rosa/20 focus:border-rosa transition-colors disabled:opacity-60"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
          <div className="relative">
            <input
              {...register('password', { required: 'La contraseña es obligatoria' })}
              type={mostrarPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={cargando}
              className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-rosa/20 focus:border-rosa transition-colors disabled:opacity-60"
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

        <div className="flex items-center justify-between pt-1">
          <button
            type="submit"
            disabled={cargando}
            className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#e91e8c' }}
          >
            {cargando && <Loader2 size={15} className="animate-spin" />}
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
          <a href="/recuperar-password" className="text-xs text-rosa hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </form>
    </div>
  );
};

// ── Formulario Registro ───────────────────────────────────────────────────────
const FormRegistro = () => {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [estado, setEstado] = useState<EstadoForm>('idle');
  const [mensaje, setMensaje] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegistroForm>();

  const onSubmit = async (datos: RegistroForm) => {
    setEstado('cargando');
    setMensaje('');
    try {
      const { confirmarPassword: _, ...payload } = datos;
      await userAuthService.register(payload);
      setEstado('ok');
      setMensaje('¡Cuenta creada! Revisá tu email para verificar tu cuenta antes de ingresar.');
      reset();
    } catch (e: any) {
      setEstado('error');
      setMensaje(e.message || 'Error al crear la cuenta');
    }
  };

  const cargando = estado === 'cargando';

  const inputCls = `w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rosa/20 focus:border-rosa transition-colors disabled:opacity-60`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <h2 className="text-lg font-bold text-marino mb-1">Crear cuenta mayorista</h2>
      <p className="text-sm text-gray-500 mb-6">Completá tus datos para registrarte</p>

      {estado === 'ok' && (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-bold text-marino mb-2">¡Revisá tu email!</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Te enviamos un link de verificación a tu correo. Hacé click en el link para activar tu cuenta y poder ingresar.
          </p>
          <button
            onClick={() => setEstado('idle')}
            className="mt-5 text-xs text-rosa hover:underline"
          >
            Registrar otra cuenta
          </button>
        </div>
      )}

      {estado !== 'ok' && (
        <>
          {estado === 'error' && <Alerta tipo="error" mensaje={mensaje} />}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Nombre completo <span className="text-rosa">*</span>
                </label>
                <input
                  {...register('nombre', { required: 'El nombre es obligatorio' })}
                  placeholder="Ej: María González"
                  disabled={cargando}
                  className={inputCls}
                />
                {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Email <span className="text-rosa">*</span>
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'El email es obligatorio',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' },
                  })}
                  placeholder="tu@email.com"
                  disabled={cargando}
                  className={inputCls}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
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
                    disabled={cargando}
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
                <label className="block text-sm text-gray-600 mb-1">
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
                    disabled={cargando}
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

              <div>
                <label className="block text-sm text-gray-600 mb-1">Empresa / Negocio</label>
                <input
                  {...register('empresa')}
                  placeholder="Ej: Distribuidora Sol"
                  disabled={cargando}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">WhatsApp / Teléfono</label>
                <input
                  {...register('telefono')}
                  placeholder="Ej: 11 1234-5678"
                  disabled={cargando}
                  className={inputCls}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors disabled:opacity-60 mt-2"
              style={{ backgroundColor: '#e91e8c' }}
            >
              {cargando && <Loader2 size={15} className="animate-spin" />}
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
const CustomerAccount = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <div className="mb-8">
      <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">Mi cuenta</p>
      <h1 className="text-2xl font-bold text-marino">Cuenta Mayorista</h1>
    </div>
    <FormLogin />
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium">¿No tenés cuenta? Registrate</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
    <FormRegistro />
  </div>
);

export default CustomerAccount;
