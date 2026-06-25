import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, LogOut, User, MapPin, Lock } from 'lucide-react';
import { userAuthService, LoginData, RegisterData } from '../services/userAuthService';
import { useUserAuthStore } from '../store/userAuthStore';
import { usePerfil, useUpdatePerfil } from '../hooks/usePerfil';

interface RegistroForm extends RegisterData {
  confirmarPassword: string;
}

type EstadoForm = 'idle' | 'cargando' | 'ok' | 'error';

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

const inputCls = `w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rosa/20 focus:border-rosa transition-colors disabled:opacity-60`;
const labelCls = 'block text-sm text-gray-600 mb-1';

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

interface FormDatosPersonales {
  nombre: string;
  apellido?: string;
  telefono?: string;
  empresa?: string;
  dni?: string;
}

interface FormDatosEntrega {
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
}

const PanelPerfil = () => {
  const { usuario, logout } = useUserAuthStore();
  const { data: perfil, isLoading } = usePerfil();
  const actualizarPerfil = useUpdatePerfil();

  const [seccion, setSeccion] = useState<'datos' | 'entrega' | 'password'>('datos');
  const [msgPersonales, setMsgPersonales] = useState('');
  const [msgEntrega, setMsgEntrega] = useState('');
  const [msgPassword, setMsgPassword] = useState('');

  const {
    register: regPersonal,
    handleSubmit: handlePersonal,
    reset: resetPersonal,
    formState: { errors: errPersonal, isDirty: dirtyPersonal },
  } = useForm<FormDatosPersonales>();

  const {
    register: regEntrega,
    handleSubmit: handleEntrega,
    reset: resetEntrega,
  } = useForm<FormDatosEntrega>();

  const {
    register: regPass,
    handleSubmit: handlePass,
    watch: watchPass,
    reset: resetPass,
    formState: { errors: errPass },
  } = useForm<{ passwordActual: string; passwordNueva: string; confirmar: string }>();

  useEffect(() => {
    if (perfil) {
      resetPersonal({
        nombre: perfil.nombre,
        apellido: perfil.apellido || '',
        telefono: perfil.telefono || '',
        empresa: perfil.empresa || '',
        dni: perfil.dni || '',
      });
      resetEntrega({
        direccion: perfil.direccion || '',
        ciudad: perfil.ciudad || '',
        provincia: perfil.provincia || '',
        codigoPostal: perfil.codigoPostal || '',
      });
    }
  }, [perfil, resetPersonal, resetEntrega]);

  const guardarPersonales = async (datos: FormDatosPersonales) => {
    try {
      await actualizarPerfil.mutateAsync({
        nombre: datos.nombre,
        apellido: datos.apellido,
        telefono: datos.telefono,
        empresa: datos.empresa,
        dni: datos.dni,
      });
      setMsgPersonales('ok');
    } catch {
      setMsgPersonales('error');
    }
    setTimeout(() => setMsgPersonales(''), 3000);
  };

  const guardarEntrega = async (datos: FormDatosEntrega) => {
    try {
      await actualizarPerfil.mutateAsync({
        nombre: perfil?.nombre || usuario?.nombre || '',
        telefono: perfil?.telefono,
        empresa: perfil?.empresa,
        dni: perfil?.dni,
        ...datos,
      });
      setMsgEntrega('ok');
    } catch {
      setMsgEntrega('error');
    }
    setTimeout(() => setMsgEntrega(''), 3000);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
      </div>
    );
  }

  const tabs = [
    { id: 'datos', label: 'Mi perfil', icon: User },
    { id: 'entrega', label: 'Datos de entrega', icon: MapPin },
    { id: 'password', label: 'Contraseña', icon: Lock },
  ] as const;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-0.5">MI CUENTA</p>
          <h2 className="text-2xl font-bold text-marino">Hola, {usuario?.nombre}</h2>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-lg transition-colors"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSeccion(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              seccion === id ? 'bg-white text-marino shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {seccion === 'datos' && (
        <form onSubmit={handlePersonal(guardarPersonales)} className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-marino mb-4">Datos personales</h3>

          {msgPersonales === 'ok' && <Alerta tipo="ok" mensaje="¡Datos actualizados correctamente!" />}
          {msgPersonales === 'error' && <Alerta tipo="error" mensaje="Error al guardar. Intentá de nuevo." />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nombre <span className="text-rosa">*</span></label>
              <input
                {...regPersonal('nombre', { required: 'El nombre es obligatorio' })}
                placeholder="María"
                className={inputCls}
              />
              {errPersonal.nombre && <p className="text-red-400 text-xs mt-1">{errPersonal.nombre.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Apellido</label>
              <input {...regPersonal('apellido')} placeholder="González" className={inputCls} />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Email</label>
              <input value={usuario?.email || ''} disabled className={`${inputCls} bg-gray-50 text-gray-400`} />
              <p className="text-xs text-gray-400 mt-1">El email no se puede cambiar</p>
            </div>

            <div>
              <label className={labelCls}>WhatsApp / Teléfono</label>
              <input {...regPersonal('telefono')} placeholder="11 1234-5678" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Empresa / Negocio</label>
              <input {...regPersonal('empresa')} placeholder="Distribuidora Sol" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>DNI / CUIL</label>
              <input {...regPersonal('dni')} placeholder="20-12345678-9" className={inputCls} />
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button
              type="submit"
              disabled={actualizarPerfil.isPending || !dirtyPersonal}
              className="flex items-center gap-2 bg-rosa text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {actualizarPerfil.isPending && <Loader2 size={14} className="animate-spin" />}
              Guardar cambios
            </button>
          </div>
        </form>
      )}

      {seccion === 'entrega' && (
        <form onSubmit={handleEntrega(guardarEntrega)} className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-rosa mb-4">
            Estos datos se usarán para completar automáticamente tu próximo pedido.
          </p>

          {msgEntrega === 'ok' && <Alerta tipo="ok" mensaje="¡Datos de entrega actualizados!" />}
          {msgEntrega === 'error' && <Alerta tipo="error" mensaje="Error al guardar. Intentá de nuevo." />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Dirección</label>
              <input {...regEntrega('direccion')} placeholder="Ej: Av. Corrientes 1234" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Ciudad</label>
              <input {...regEntrega('ciudad')} placeholder="Ej: Buenos Aires" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Provincia</label>
              <select {...regEntrega('provincia')} className={inputCls}>
                <option value="">Seleccioná una provincia</option>
                {PROVINCIAS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Código postal</label>
              <input {...regEntrega('codigoPostal')} placeholder="4178" className={inputCls} />
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button
              type="submit"
              disabled={actualizarPerfil.isPending}
              className="flex items-center gap-2 bg-rosa text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {actualizarPerfil.isPending && <Loader2 size={14} className="animate-spin" />}
              Guardar datos
            </button>
          </div>
        </form>
      )}

      {seccion === 'password' && (
        <form
          onSubmit={handlePass(async (datos) => {
            setMsgPassword('');
            try {
              await userAuthService.cambiarPassword(datos.passwordActual, datos.passwordNueva);
              setMsgPassword('ok');
              resetPass();
            } catch (e: any) {
              setMsgPassword(e.message || 'Error al cambiar la contraseña');
            }
            setTimeout(() => setMsgPassword(''), 4000);
          })}
          className="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
        >
          <h3 className="font-semibold text-marino mb-2">Cambiar contraseña</h3>

          {msgPassword === 'ok' && <Alerta tipo="ok" mensaje="¡Contraseña actualizada correctamente!" />}
          {msgPassword && msgPassword !== 'ok' && <Alerta tipo="error" mensaje={msgPassword} />}

          <div>
            <label className={labelCls}>Contraseña actual <span className="text-rosa">*</span></label>
            <input
              {...regPass('passwordActual', { required: 'Ingresá tu contraseña actual' })}
              type="password"
              placeholder="••••••••"
              className={inputCls}
            />
            {errPass.passwordActual && <p className="text-red-400 text-xs mt-1">{errPass.passwordActual.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Nueva contraseña <span className="text-rosa">*</span></label>
            <input
              {...regPass('passwordNueva', {
                required: 'Ingresá la nueva contraseña',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
              type="password"
              placeholder="••••••••"
              className={inputCls}
            />
            {errPass.passwordNueva && <p className="text-red-400 text-xs mt-1">{errPass.passwordNueva.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Confirmar nueva contraseña <span className="text-rosa">*</span></label>
            <input
              {...regPass('confirmar', {
                required: 'Confirmá la nueva contraseña',
                validate: (v) => v === watchPass('passwordNueva') || 'Las contraseñas no coinciden',
              })}
              type="password"
              placeholder="••••••••"
              className={inputCls}
            />
            {errPass.confirmar && <p className="text-red-400 text-xs mt-1">{errPass.confirmar.message}</p>}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-rosa text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Cambiar contraseña
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

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

      {estado === 'error' && <Alerta tipo="error" mensaje={mensaje} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelCls}>Correo electrónico</label>
          <input
            type="email"
            {...register('email', { required: 'El email es obligatorio' })}
            placeholder="tu@email.com"
            disabled={cargando}
            className={inputCls}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Contraseña</label>
          <div className="relative">
            <input
              {...register('password', { required: 'La contraseña es obligatoria' })}
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
              {mostrarPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="submit"
            disabled={cargando}
            className="flex items-center gap-2 bg-rosa text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors disabled:opacity-60"
          >
            {cargando && <Loader2 size={15} className="animate-spin" />}
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
          <Link to="/recuperar-password" className="text-xs text-rosa hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </form>
    </div>
  );
};

const FormRegistro = () => {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [estado, setEstado] = useState<EstadoForm>('idle');
  const [mensaje, setMensaje] = useState('');

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<RegistroForm>();

  const onSubmit = async (datos: RegistroForm) => {
    setEstado('cargando');
    setMensaje('');
    try {
      const { confirmarPassword: _, ...payload } = datos;
      await userAuthService.register(payload);
      setEstado('ok');
      reset();
    } catch (e: any) {
      setEstado('error');
      setMensaje(e.message || 'Error al crear la cuenta');
    }
  };

  const cargando = estado === 'cargando';

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
            Te enviamos un link de verificación. Hacé click para activar tu cuenta.
          </p>
          <button onClick={() => setEstado('idle')} className="mt-5 text-xs text-rosa hover:underline">
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
                <label className={labelCls}>Nombre completo <span className="text-rosa">*</span></label>
                <input {...register('nombre', { required: 'El nombre es obligatorio' })} placeholder="Ej: María González" disabled={cargando} className={inputCls} />
                {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Email <span className="text-rosa">*</span></label>
                <input type="email" {...register('email', { required: 'El email es obligatorio', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' } })} placeholder="tu@email.com" disabled={cargando} className={inputCls} />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Contraseña <span className="text-rosa">*</span></label>
                <div className="relative">
                  <input {...register('password', { required: 'La contraseña es obligatoria', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} type={mostrarPassword ? 'text' : 'password'} placeholder="••••••••" disabled={cargando} className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Confirmar contraseña <span className="text-rosa">*</span></label>
                <div className="relative">
                  <input {...register('confirmarPassword', { required: 'Confirmá tu contraseña', validate: (v) => v === watch('password') || 'Las contraseñas no coinciden' })} type={mostrarConfirm ? 'text' : 'password'} placeholder="••••••••" disabled={cargando} className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setMostrarConfirm(!mostrarConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {mostrarConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmarPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmarPassword.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Empresa / Negocio</label>
                <input {...register('empresa')} placeholder="Ej: Distribuidora Sol" disabled={cargando} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>WhatsApp / Teléfono</label>
                <input {...register('telefono')} placeholder="Ej: 11 1234-5678" disabled={cargando} className={inputCls} />
              </div>
            </div>
            <button type="submit" disabled={cargando} className="flex items-center gap-2 bg-rosa text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors disabled:opacity-60 mt-2">
              {cargando && <Loader2 size={15} className="animate-spin" />}
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

const CustomerAccount = () => {
  const estaAutenticado = useUserAuthStore((s) => s.estaAutenticado);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">Mi cuenta</p>
        <h1 className="text-2xl font-bold text-marino">Cuenta Mayorista</h1>
      </div>

      {estaAutenticado ? (
        <PanelPerfil />
      ) : (
        <>
          <FormLogin />
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">¿No tenés cuenta? Registrate</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <FormRegistro />
        </>
      )}
    </div>
  );
};

export default CustomerAccount;
