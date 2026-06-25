import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, MapPin, ShoppingBag, LogOut, Loader2, CheckCircle2, AlertCircle, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useUserAuthStore } from '../store/userAuthStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Pedido, EstadoPedido } from '../types/pedido';
import { usePerfil, useUpdatePerfil } from '../hooks/usePerfil';

const formatPrecio = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

const formatFecha = (s: string) =>
  new Date(s).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

const colorEstado: Record<EstadoPedido, string> = {
  pendiente:      'bg-yellow-100 text-yellow-700',
  confirmado:     'bg-blue-100 text-blue-700',
  en_preparacion: 'bg-purple-100 text-purple-700',
  enviado:        'bg-indigo-100 text-indigo-700',
  entregado:      'bg-emerald-100 text-emerald-700',
  cancelado:      'bg-red-100 text-red-500',
};

const labelEstado: Record<EstadoPedido, string> = {
  pendiente:      'Pendiente',
  confirmado:     'Confirmado',
  en_preparacion: 'En preparación',
  enviado:        'Enviado',
  entregado:      'Entregado',
  cancelado:      'Cancelado',
};

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-rosa focus:ring-2 focus:ring-rosa/10 transition-colors disabled:opacity-60';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

const Alerta = ({ tipo, mensaje }: { tipo: 'ok' | 'error'; mensaje: string }) => (
  <div className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm mb-4 ${
    tipo === 'ok' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-600'
  }`}>
    {tipo === 'ok' ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" /> : <AlertCircle size={15} className="shrink-0 mt-0.5" />}
    <span>{mensaje}</span>
  </div>
);

interface FormPersonales { nombre: string; apellido?: string; telefono?: string; empresa?: string; dni?: string; }
interface FormEntrega { direccion?: string; ciudad?: string; provincia?: string; codigoPostal?: string; }

type Tab = 'perfil' | 'entrega' | 'pedidos';

// ── Sección Mi perfil ─────────────────────────────────────────────────────────
const SeccionPerfil = () => {
  const { usuario } = useUserAuthStore();
  const { data: perfil, isLoading } = usePerfil();
  const actualizarPerfil = useUpdatePerfil();
  const [msg, setMsg] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormPersonales>();

  useEffect(() => {
    if (perfil) {
      reset({
        nombre: perfil.nombre,
        apellido: perfil.apellido || '',
        telefono: perfil.telefono || '',
        empresa: perfil.empresa || '',
        dni: perfil.dni || '',
      });
    }
  }, [perfil, reset]);

  const onSubmit = async (datos: FormPersonales) => {
    try {
      await actualizarPerfil.mutateAsync({
        nombre: datos.nombre,
        apellido: datos.apellido,
        telefono: datos.telefono,
        empresa: datos.empresa,
        dni: datos.dni,
        direccion: perfil?.direccion,
        ciudad: perfil?.ciudad,
        provincia: perfil?.provincia,
        codigoPostal: perfil?.codigoPostal,
      });
      setMsg('ok');
    } catch {
      setMsg('error');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>;

  return (
    <div className="space-y-5">
      {/* Avatar + info */}
      <div className="flex items-center gap-4 p-5 bg-rosa-suave rounded-xl">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ background: '#e91e8c' }}>
          {usuario?.nombre?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-marino text-lg">{usuario?.nombre}</p>
          <p className="text-sm text-gray-500">{usuario?.email}</p>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
            <CheckCircle2 size={11} /> Cuenta verificada
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {msg === 'ok' && <Alerta tipo="ok" mensaje="¡Datos actualizados correctamente!" />}
        {msg === 'error' && <Alerta tipo="error" mensaje="Error al guardar. Intentá de nuevo." />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nombre <span className="text-rosa">*</span></label>
            <input {...register('nombre', { required: 'El nombre es obligatorio' })} placeholder="María" className={inputCls} />
            {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Apellido</label>
            <input {...register('apellido')} placeholder="González" className={inputCls} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Email</label>
            <input value={usuario?.email || ''} disabled className={`${inputCls} bg-gray-50 text-gray-400`} />
            <p className="text-xs text-gray-400 mt-1">El email no se puede cambiar</p>
          </div>

          <div>
            <label className={labelCls}>WhatsApp / Teléfono</label>
            <input {...register('telefono')} placeholder="11 1234-5678" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Empresa / Negocio</label>
            <input {...register('empresa')} placeholder="Distribuidora Sol" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>DNI / CUIL</label>
            <input {...register('dni')} placeholder="20-12345678-9" className={inputCls} />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={actualizarPerfil.isPending || !isDirty}
            className="flex items-center gap-2 bg-rosa text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {actualizarPerfil.isPending && <Loader2 size={14} className="animate-spin" />}
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
};

// ── Sección Datos de Entrega ──────────────────────────────────────────────────
const SeccionEntrega = () => {
  const { usuario } = useUserAuthStore();
  const { data: perfil, isLoading } = usePerfil();
  const actualizarPerfil = useUpdatePerfil();
  const [msg, setMsg] = useState('');

  const { register, handleSubmit, reset } = useForm<FormEntrega>();

  useEffect(() => {
    if (perfil) {
      reset({
        direccion: perfil.direccion || '',
        ciudad: perfil.ciudad || '',
        provincia: perfil.provincia || '',
        codigoPostal: perfil.codigoPostal || '',
      });
    }
  }, [perfil, reset]);

  const onSubmit = async (datos: FormEntrega) => {
    try {
      await actualizarPerfil.mutateAsync({
        nombre: perfil?.nombre || usuario?.nombre || '',
        telefono: perfil?.telefono,
        empresa: perfil?.empresa,
        dni: perfil?.dni,
        ...datos,
      });
      setMsg('ok');
    } catch {
      setMsg('error');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-gray-500">
        Estos datos se usarán para completar automáticamente tu próximo pedido.
      </p>

      {msg === 'ok' && <Alerta tipo="ok" mensaje="¡Datos de entrega actualizados!" />}
      {msg === 'error' && <Alerta tipo="error" mensaje="Error al guardar. Intentá de nuevo." />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Dirección</label>
          <input {...register('direccion')} placeholder="Ej: Av. Corrientes 1234" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Ciudad</label>
          <input {...register('ciudad')} placeholder="Ej: Buenos Aires" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Provincia</label>
          <select {...register('provincia')} className={inputCls}>
            <option value="">Seleccioná una provincia</option>
            {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Código postal</label>
          <input {...register('codigoPostal')} placeholder="4178" className={inputCls} />
        </div>
      </div>

      <div className="flex justify-end">
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
  );
};

// ── Sección Mis Pedidos ───────────────────────────────────────────────────────
const SeccionPedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('gifty-user-auth') || '{}')?.state?.token;
    api.get('/pedidos/mis-pedidos', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setPedidos(r.data.datos))
      .catch(() => setPedidos([]))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={28} className="animate-spin text-rosa" />
    </div>
  );

  if (pedidos.length === 0) return (
    <div className="flex flex-col items-center py-16 text-gray-300">
      <ShoppingBag size={48} strokeWidth={1} />
      <p className="text-sm mt-3 text-gray-400">Todavía no realizaste ningún pedido</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {pedidos.map((pedido) => (
        <div key={pedido._id} className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandido(expandido === pedido._id ? null : pedido._id)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-rosa-suave flex items-center justify-center shrink-0">
                <Package size={15} className="text-rosa" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-bold text-marino">{pedido.numeroPedido}</p>
                <p className="text-xs text-gray-400">{formatFecha(pedido.createdAt)} · {pedido.items.length} {pedido.items.length === 1 ? 'producto' : 'productos'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colorEstado[pedido.estado]}`}>
                {labelEstado[pedido.estado]}
              </span>
              <p className="text-sm font-bold text-marino hidden sm:block">{formatPrecio(pedido.total)}</p>
              {expandido === pedido._id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </button>

          {expandido === pedido._id && (
            <div className="border-t border-gray-50 px-5 py-4 bg-gray-50/50 space-y-3">
              {pedido.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.imagen
                    ? <img src={item.imagen} alt={item.nombre} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                    : <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{item.nombre}</p>
                    <p className="text-xs text-gray-400">x{item.cantidad} · {formatPrecio(item.precio)} c/u</p>
                  </div>
                  <p className="text-sm font-semibold text-marino shrink-0">{formatPrecio(item.precio * item.cantidad)}</p>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-400 space-y-0.5">
                  <p>Entrega: {pedido.cliente.direccion}, {pedido.cliente.ciudad}</p>
                  {pedido.metodoPago && <p>Pago: {pedido.metodoPago}</p>}
                </div>
                <p className="text-base font-bold text-marino">{formatPrecio(pedido.total)}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
const MiCuenta = () => {
  const [tab, setTab] = useState<Tab>('perfil');
  const { usuario, logout } = useUserAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/cuenta-mayorista');
  };

  const tabs: { id: Tab; label: string; icono: React.ElementType }[] = [
    { id: 'perfil',  label: 'Mi perfil',       icono: User },
    { id: 'entrega', label: 'Datos de entrega', icono: MapPin },
    { id: 'pedidos', label: 'Mis pedidos',      icono: ShoppingBag },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">Mi cuenta</p>
          <h1 className="text-2xl font-bold text-marino">Hola, {usuario?.nombre?.split(' ')[0]} 👋</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 border border-gray-200 hover:border-red-200 px-4 py-2 rounded-lg transition-colors"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {tabs.map(({ id, label, icono: Icono }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === id ? 'bg-white text-marino shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icono size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        {tab === 'perfil'  && <SeccionPerfil />}
        {tab === 'entrega' && <SeccionEntrega />}
        {tab === 'pedidos' && <SeccionPedidos />}
      </div>
    </div>
  );
};

export default MiCuenta;
