import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

// Formulario de login del cliente
interface LoginForm {
  emailOUsuario: string;
  password: string;
  recuerdame: boolean;
}

// Formulario de registro de cuenta mayorista
interface RegistroForm {
  usuario: string;
  email: string;
  password: string;
  confirmarPassword: string;
  empresa?: string;
  telefono?: string;
}

// ── Login ─────────────────────────────────────────────────────────────────
const FormLogin = () => {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (_datos: LoginForm) => {
    // TODO: integrar con endpoint de auth de clientes
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Nombre de usuario o correo electrónico
        </label>
        <input
          {...register('emailOUsuario', { required: true })}
          className="w-full bg-gray-100 border-0 rounded px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-rosa/30"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
        <div className="relative">
          <input
            {...register('password', { required: true })}
            type={mostrarPassword ? 'text' : 'password'}
            className="w-full bg-gray-100 border-0 rounded px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-rosa/30 pr-10"
          />
          <button
            type="button"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="text-white text-xs font-bold uppercase tracking-widest px-6 py-3 disabled:opacity-60"
          style={{ backgroundColor: '#e84da0' }}
        >
          ACCESO
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" {...register('recuerdame')} className="accent-rosa" />
          Recuérdame
        </label>
      </div>

      <button type="button" className="text-sm text-rosa hover:underline block">
        ¿Olvidaste la contraseña?
      </button>
    </form>
  );
};

// ── Registro ──────────────────────────────────────────────────────────────
const FormRegistro = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<RegistroForm>();

  const onSubmit = async (_datos: RegistroForm) => {
    // TODO: integrar con endpoint de registro de clientes
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Usuario */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Usuario <span className="text-rosa">*</span>
          </label>
          <input
            {...register('usuario', { required: true })}
            className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-rosa"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Email <span className="text-rosa">*</span>
          </label>
          <input
            type="email"
            {...register('email', { required: true })}
            className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-rosa"
          />
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Contraseña <span className="text-rosa">*</span>
          </label>
          <input
            type="password"
            {...register('password', { required: true })}
            className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-rosa"
          />
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Confirmar contraseña <span className="text-rosa">*</span>
          </label>
          <input
            type="password"
            {...register('confirmarPassword', {
              required: true,
              validate: (v) => v === watch('password') || 'Las contraseñas no coinciden',
            })}
            className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-rosa"
          />
        </div>

        {/* Empresa */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Nombre empresa</label>
          <input
            {...register('empresa')}
            className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-rosa"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Whatsapp - Teléfono</label>
          <input
            {...register('telefono')}
            className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm outline-none focus:border-rosa"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-marino hover:bg-marino-oscuro text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors disabled:opacity-60"
      >
        Enviar
      </button>
    </form>
  );
};

// ── Página principal Cuenta Mayorista ─────────────────────────────────────
const CustomerAccount = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* Sección login */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
        <FormLogin />
      </div>

      {/* Separador de registro */}
      <p className="text-center text-sm text-gray-500 mb-8">
        ↓ Crea tu cuenta mayorista ↓
      </p>

      {/* Sección registro */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <FormRegistro />
      </div>

    </div>
  );
};

export default CustomerAccount;
