import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, CheckCircle2, LogIn, Loader2, ShieldCheck, Tag, AlertTriangle, ChevronDown, X,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useCreateOrder } from '../hooks/useOrders';
import { useUserAuthStore } from '../store/userAuthStore';
import { useConfig } from '../hooks/useConfig';
import { usePerfil } from '../hooks/usePerfil';
import { DatosCliente } from '../types/pedido';
import { cuponService } from '../services/cuponService';

// ── Tipos ────────────────────────────────────────────────────────────────────
type FormData = DatosCliente & { notas?: string };

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

const inputCls =
  'w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#9b5ab3] focus:ring-1 focus:ring-[#9b5ab3]/20 transition-colors bg-white';
const labelCls = 'block text-sm text-gray-600 mb-1';

// Provincias argentinas para el select
const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

// ── Componente ────────────────────────────────────────────────────────────────
const Checkout = () => {
  const { items, vaciarCarrito } = useCart();
  const crearPedido = useCreateOrder();
  const { usuario, estaAutenticado } = useUserAuthStore();
  const { data: config } = useConfig();
  const { data: perfil } = usePerfil();

  const [metodoPago, setMetodoPago] = useState('');
  const [medioEnvio, setMedioEnvio] = useState('');
  const [pedidoConfirmado, setPedidoConfirmado] = useState<string | null>(null);
  const [cuponAbierto, setCuponAbierto] = useState(false);
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState<{ codigo: string; descuento: number } | null>(null);
  const [cuponError, setCuponError] = useState('');
  const [cuponCargando, setCuponCargando] = useState(false);
  const [suscripcion, setSuscripcion] = useState(true);
  // true = mostrar el banner de autocompletar, null = ya respondió (no mostrar más)
  const [mostrarBannerPerfil, setMostrarBannerPerfil] = useState<boolean>(true);

  // Inicializar primer método de pago y envío cuando llega la config
  useEffect(() => {
    if (config) {
      if (config.metodosPago.length > 0 && !metodoPago) setMetodoPago(config.metodosPago[0]);
      if (config.mediosEnvio.length > 0 && !medioEnvio) setMedioEnvio(config.mediosEnvio[0]);
    }
  }, [config]);

  // ── Lógica de precios / descuentos ───────────────────────────────────────
  const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0);
  const pctEfectivo = config?.descuentoEfectivo ?? 0;

  // Detecta si el método seleccionado es efectivo (se compara en minúsculas)
  const esEfectivo = metodoPago.toLowerCase().includes('efectivo');

  const precioUnitario = (precioLista: number) =>
    esEfectivo && pctEfectivo > 0
      ? Math.round(precioLista * (1 - pctEfectivo / 100))
      : precioLista;

  const subtotal = items.reduce(
    (acc, item) => acc + precioUnitario(item.producto.precio) * item.cantidad, 0
  );

  const descuentoAplicable = config?.descuentos
    ?.filter((d) => subtotal >= d.montoDesde)
    .sort((a, b) => b.porcentaje - a.porcentaje)[0] ?? null;

  const montoDescuento = descuentoAplicable
    ? Math.round(subtotal * descuentoAplicable.porcentaje / 100)
    : 0;

  const totalSinCupon = subtotal - montoDescuento;
  const total = Math.max(0, totalSinCupon - (cuponAplicado?.descuento ?? 0));

  const compraMinima = config?.compraMinima ?? 0;
  const bajominimo = compraMinima > 0 && cantidadTotal < compraMinima;

  const itemsParaPedido = items.map((item) => ({
    productoId: item.producto._id,
    nombre: item.producto.nombre,
    precio: precioUnitario(item.producto.precio),
    cantidad: item.cantidad,
    imagen: item.producto.imagenes[0] || '',
  }));

  // ── Form ─────────────────────────────────────────────────────────────────
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();

  useEffect(() => {
    // Para usuarios no logueados: prellenar desde localStorage si existe
    if (!estaAutenticado) {
      const entrega = localStorage.getItem('gifty-datos-entrega');
      if (entrega) reset(JSON.parse(entrega));
    }
  }, [estaAutenticado, reset]);

  // ── Carrito vacío ─────────────────────────────────────────────────────────
  if (items.length === 0 && !pedidoConfirmado) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Tu carrito está vacío.</p>
        <Link to="/tienda" className="btn-primario">Ir a la tienda</Link>
      </div>
    );
  }

  const aplicarCupon = async () => {
    if (!codigoCupon.trim()) return;
    setCuponError('');
    setCuponCargando(true);
    try {
      const res = await cuponService.validar(codigoCupon.trim(), totalSinCupon);
      setCuponAplicado({ codigo: res.cupon.codigo, descuento: res.descuento });
      setCuponError('');
    } catch (e: any) {
      setCuponError(e.message || 'Cupón inválido');
      setCuponAplicado(null);
    } finally {
      setCuponCargando(false);
    }
  };

  const quitarCupon = () => {
    setCuponAplicado(null);
    setCodigoCupon('');
    setCuponError('');
  };

  // Rellena el formulario con los datos guardados en el perfil del usuario
  const autocompletarConPerfil = () => {
    if (!perfil) return;
    reset({
      nombre: perfil.nombre,
      apellido: perfil.apellido || '',
      email: perfil.email,
      empresa: perfil.empresa || '',
      telefono: perfil.telefono || '',
      dni: perfil.dni || '',
      direccion: perfil.direccion || '',
      ciudad: perfil.ciudad || '',
      provincia: perfil.provincia || '',
      codigoPostal: perfil.codigoPostal || '',
    });
    setMostrarBannerPerfil(false);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (datos: FormData) => {
    const { notas, ...cliente } = datos;
    const pedido = await crearPedido.mutateAsync({
      cliente,
      items: itemsParaPedido,
      metodoPago,
      medioEnvio,
      notas,
      cuponCodigo: cuponAplicado?.codigo,
    });
    setPedidoConfirmado(pedido.numeroPedido);
    vaciarCarrito();
  };

  // ── Pantalla de éxito ─────────────────────────────────────────────────────
  if (pedidoConfirmado) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-marino mb-2">¡Pedido realizado!</h1>
        <p className="text-gray-500 mb-1">Tu número de pedido es:</p>
        <p className="text-2xl font-mono font-bold text-rosa mb-6">{pedidoConfirmado}</p>
        <p className="text-sm text-gray-500 mb-8">
          Nos pondremos en contacto a la brevedad para coordinar el pago y el envío.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/tienda" className="btn-primario">Seguir comprando</Link>
          {estaAutenticado && (
            <Link to="/mi-cuenta" className="btn-secundario">Ver mis pedidos</Link>
          )}
        </div>
      </div>
    );
  }

  // ── Checkout ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/tienda" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-rosa mb-6">
        <ChevronLeft size={16} /> Volver a la tienda
      </Link>

      {/* Banner usuario no logueado */}
      {!estaAutenticado && (
        <div className="flex items-center justify-between bg-rosa-suave border border-rosa/20 rounded-xl px-5 py-3.5 mb-5">
          <div className="flex items-center gap-3">
            <LogIn size={18} className="text-rosa shrink-0" />
            <p className="text-sm text-gray-700">
              <span className="font-semibold">¿Tenés cuenta?</span> Iniciá sesión para guardar tu historial de pedidos.
            </p>
          </div>
          <Link to="/cuenta-mayorista" className="text-xs font-semibold text-white bg-rosa px-4 py-2 rounded-lg shrink-0 ml-4 hover:opacity-90 transition-opacity">
            Ingresar
          </Link>
        </div>
      )}

      {/* Banner autocompletar con datos del perfil */}
      {estaAutenticado && perfil && perfil.direccion && mostrarBannerPerfil && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-5">
          <div>
            <p className="text-sm font-semibold text-blue-800">¿Usás tus datos guardados?</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Tenemos tu dirección y datos de contacto guardados. ¿Querés autocompletar el formulario?
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={autocompletarConPerfil}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Sí, usar mis datos
            </button>
            <button
              type="button"
              onClick={() => setMostrarBannerPerfil(false)}
              className="px-4 py-2 border border-blue-300 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
            >
              No, ingresar manual
            </button>
          </div>
        </div>
      )}

      {/* Alerta compra mínima */}
      {bajominimo && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-5">
          <AlertTriangle size={18} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            El pedido mínimo es de <span className="font-semibold">{compraMinima} unidades</span>.
            Tenés <span className="font-semibold">{cantidadTotal}</span>. Agregá{' '}
            <span className="font-semibold">{compraMinima - cantidadTotal} más</span> para continuar.
          </p>
          <Link to="/tienda" className="ml-auto text-xs font-semibold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg shrink-0 hover:bg-amber-100 transition-colors">
            Ver tienda
          </Link>
        </div>
      )}

      {/* Banner cupón */}
      <div className="border border-gray-200 rounded mb-6 overflow-hidden">
        <button
          type="button"
          onClick={() => setCuponAbierto((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#f3e8ff] text-[#7c3aed] text-sm font-medium hover:bg-[#ede9fe] transition-colors"
        >
          <span>¿Tenés un cupón de descuento?</span>
          <ChevronDown size={16} className={`transition-transform ${cuponAbierto ? 'rotate-180' : ''}`} />
        </button>
        {cuponAbierto && (
          <div className="px-4 py-3 border-t border-gray-100 space-y-2">
            {cuponAplicado ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
                <div className="flex items-center gap-2 text-emerald-700 text-sm">
                  <CheckCircle2 size={15} />
                  <span>Cupón <strong>{cuponAplicado.codigo}</strong> aplicado — descuento: <strong>{fmt(cuponAplicado.descuento)}</strong></span>
                </div>
                <button type="button" onClick={quitarCupon} className="text-emerald-500 hover:text-emerald-700 ml-3">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codigoCupon}
                  onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), aplicarCupon())}
                  placeholder="Ingresá tu código"
                  className={`${inputCls} max-w-xs uppercase`}
                />
                <button
                  type="button"
                  onClick={aplicarCupon}
                  disabled={cuponCargando || !codigoCupon.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#9b5ab3] text-white text-sm rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {cuponCargando ? <Loader2 size={14} className="animate-spin" /> : null}
                  Aplicar
                </button>
              </div>
            )}
            {cuponError && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <AlertTriangle size={12} /> {cuponError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Layout principal: 2 columnas ──────────────────────────────────── */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-10">

        {/* ── Columna izquierda: formulario ─────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">

          <h2 className="text-base font-semibold text-gray-700 mb-4">Detalles de facturación</h2>

          {/* Nombre y Apellidos */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelCls}>Nombre <span className="text-red-500">*</span></label>
              <input
                {...register('nombre', { required: 'Obligatorio' })}
                placeholder="María"
                className={inputCls}
              />
              {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Apellido <span className="text-red-500">*</span></label>
              <input
                {...register('apellido')}
                placeholder="González"
                className={inputCls}
              />
            </div>
          </div>

          {/* DNI / CUIL */}
          <div className="mb-3">
            <label className={labelCls}>DNI/CUIL</label>
            <input {...register('dni')} placeholder="" className={inputCls} />
          </div>

          {/* Teléfono */}
          <div className="mb-3">
            <label className={labelCls}>Teléfono <span className="text-red-500">*</span></label>
            <input
              {...register('telefono', { required: 'Obligatorio' })}
              placeholder="+543812032666"
              className={inputCls}
            />
            {errors.telefono && <p className="text-red-400 text-xs mt-1">{errors.telefono.message}</p>}
          </div>

          {/* País */}
          <div className="mb-3">
            <label className={labelCls}>País / Región <span className="text-red-500">*</span></label>
            <select className={inputCls} defaultValue="Argentina" disabled>
              <option>Argentina</option>
            </select>
          </div>

          {/* Provincia */}
          <div className="mb-3">
            <label className={labelCls}>Región / Provincia <span className="text-red-500">*</span></label>
            <select
              {...register('provincia', { required: 'Obligatorio' })}
              className={inputCls}
            >
              <option value="">Seleccioná una provincia</option>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.provincia && <p className="text-red-400 text-xs mt-1">{errors.provincia.message}</p>}
          </div>

          {/* Código postal */}
          <div className="mb-3">
            <label className={labelCls}>Código postal</label>
            <input {...register('codigoPostal')} placeholder="4178" className={inputCls} />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className={labelCls}>Dirección de correo electrónico <span className="text-red-500">*</span></label>
            <input
              type="email"
              {...register('email', {
                required: 'Obligatorio',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
              })}
              placeholder="tu@email.com"
              className={inputCls}
              readOnly={!!usuario}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Dirección (envío) */}
          <div className="mb-3">
            <label className={labelCls}>En caso de ser envío: <span className="text-gray-400 text-xs font-normal">(opcional)</span></label>
            <input
              {...register('direccion', { required: 'Obligatorio' })}
              placeholder="Av. Corrientes 1234"
              className={inputCls}
            />
            {errors.direccion && <p className="text-red-400 text-xs mt-1">{errors.direccion.message}</p>}
          </div>

          {/* Ciudad */}
          <div className="mb-3">
            <label className={labelCls}>Ciudad <span className="text-red-500">*</span></label>
            <input
              {...register('ciudad', { required: 'Obligatorio' })}
              placeholder="Ej: Buenos Aires"
              className={inputCls}
            />
            {errors.ciudad && <p className="text-red-400 text-xs mt-1">{errors.ciudad.message}</p>}
          </div>

          {/* Notas del pedido */}
          <div className="mb-4">
            <label className={labelCls}>Notas del pedido <span className="text-gray-400 text-xs font-normal">(opcional)</span></label>
            <textarea
              {...register('notas')}
              rows={4}
              placeholder="Notas sobre tu pedido, por ejemplo, notas especiales para la entrega."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Suscripción boletín */}
          <label className="flex items-center gap-2 text-sm text-gray-600 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={suscripcion}
              onChange={(e) => setSuscripcion(e.target.checked)}
              className="accent-[#9b5ab3] w-4 h-4"
            />
            Suscríbete a nuestro boletín
          </label>

          {crearPedido.isError && (
            <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-3 mb-4">
              {crearPedido.error?.message || 'Error al procesar el pedido'}
            </p>
          )}
        </form>

        {/* ── Columna derecha: resumen + envío + pago ───────────────────── */}
        <div>

          {/* Tabla resumen */}
          <table className="w-full text-sm border border-gray-200 mb-0">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-semibold text-gray-700">Producto</th>
                <th className="text-left px-3 py-2.5 font-semibold text-gray-700">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const precio = precioUnitario(item.producto.precio);
                return (
                  <tr key={item.producto._id} className="border-b border-gray-100">
                    <td className="px-3 py-2.5 text-gray-600">
                      {item.producto.nombre} <span className="font-semibold">× {item.cantidad}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700">{fmt(precio * item.cantidad)}</td>
                  </tr>
                );
              })}

              {/* Subtotal */}
              <tr className="border-b border-gray-200">
                <td className="px-3 py-2.5 font-semibold text-gray-700">Subtotal</td>
                <td className="px-3 py-2.5 text-gray-700">{fmt(subtotal)}</td>
              </tr>

              {/* Descuento por monto */}
              {descuentoAplicable && (
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2.5 font-semibold text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Tag size={13} className="text-emerald-600" />
                      Descuento {descuentoAplicable.porcentaje}% OFF
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-emerald-600 font-semibold">
                    −{fmt(montoDescuento)} <button type="button" className="text-xs text-[#9b5ab3] ml-1 hover:underline">[Eliminar]</button>
                  </td>
                </tr>
              )}

              {/* Descuento efectivo (informativo) */}
              {esEfectivo && pctEfectivo > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2.5 font-semibold text-gray-700">Descuento efectivo {pctEfectivo}%</td>
                  <td className="px-3 py-2.5 text-emerald-600 font-semibold">✓ aplicado</td>
                </tr>
              )}

              {/* Envío — radios */}
              <tr className="border-b border-gray-200">
                <td className="px-3 py-3 font-semibold text-gray-700 align-top">Envío</td>
                <td className="px-3 py-3">
                  <div className="space-y-1.5">
                    {config?.mediosEnvio.length ? (
                      config.mediosEnvio.map((medio) => (
                        <label key={medio} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                          <input
                            type="radio"
                            name="medioEnvio"
                            value={medio}
                            checked={medioEnvio === medio}
                            onChange={() => setMedioEnvio(medio)}
                            className="accent-[#9b5ab3]"
                          />
                          {medio}
                        </label>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">A coordinar</span>
                    )}
                  </div>
                </td>
              </tr>

              {/* Descuento cupón */}
              {cuponAplicado && (
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-2.5 font-semibold text-gray-700">
                    Cupón <span className="font-mono text-[#9b5ab3]">{cuponAplicado.codigo}</span>
                  </td>
                  <td className="px-3 py-2.5 text-emerald-600 font-semibold">
                    −{fmt(cuponAplicado.descuento)}
                    <button type="button" onClick={quitarCupon} className="text-xs text-gray-400 ml-1 hover:text-red-400">[Quitar]</button>
                  </td>
                </tr>
              )}

              {/* Total */}
              <tr>
                <td className="px-3 py-3 font-bold text-gray-800 text-base">Total</td>
                <td className="px-3 py-3 font-bold text-gray-800 text-base">{fmt(total)}</td>
              </tr>
            </tbody>
          </table>

          {/* Próximo descuento disponible */}
          {config?.descuentos && config.descuentos.length > 0 && (() => {
            const siguiente = config.descuentos
              .filter((d) => subtotal < d.montoDesde)
              .sort((a, b) => a.montoDesde - b.montoDesde)[0];
            if (!siguiente) return null;
            return (
              <p className="text-xs text-gray-400 text-center mt-2 mb-4">
                Agregá <span className="font-semibold text-rosa">{fmt(siguiente.montoDesde - subtotal)}</span> más para{' '}
                <span className="font-semibold text-emerald-600">{siguiente.porcentaje}% de descuento</span>
              </p>
            );
          })()}

          {/* Métodos de pago */}
          <div className="border border-gray-200 rounded mt-4 divide-y divide-gray-100">
            {config?.metodosPago.length ? (
              config.metodosPago.map((metodo) => {
                const seleccionado = metodoPago === metodo;
                const esEsteEfectivo = metodo.toLowerCase().includes('efectivo');
                const esTransferencia = metodo.toLowerCase().includes('transferencia');
                return (
                  <div key={metodo}>
                    <label className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${seleccionado ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name="metodoPago"
                        value={metodo}
                        checked={seleccionado}
                        onChange={() => setMetodoPago(metodo)}
                        className="accent-[#9b5ab3]"
                      />
                      <span className={`text-sm ${seleccionado ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                        {metodo}
                        {esEsteEfectivo && pctEfectivo > 0 && (
                          <span className="ml-1 text-emerald-600 font-semibold">({pctEfectivo}% OFF)</span>
                        )}
                      </span>
                    </label>
                    {/* Descripción expandible al seleccionar */}
                    {seleccionado && esTransferencia && (
                      <div className="mx-4 mb-3 bg-[#f3e8ff]/60 border border-[#d8b4fe] rounded px-3 py-2.5 text-xs text-[#6b21a8] leading-relaxed">
                        SI EL DEPÓSITO NO ES REALIZADO DENTRO DE LAS PROXIMAS 4HS, LA COMPRA SERÁ ANULADA. POR FAVOR ENVIÁ EL COMPROBANTE PARA QUE PODAMOS PREPARAR TU PEDIDO.
                        <br />
                        <span className="text-gray-600">Te enviaremos los datos de la cuenta bancaria a tu e-mail una vez finalizada la compra.</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Fallback si config no tiene métodos cargados aún
              ['Transferencia bancaria', 'Efectivo'].map((metodo) => (
                <label key={metodo} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${metodoPago === metodo ? 'bg-gray-50' : ''}`}>
                  <input
                    type="radio"
                    name="metodoPago"
                    value={metodo}
                    checked={metodoPago === metodo}
                    onChange={() => setMetodoPago(metodo)}
                    className="accent-[#9b5ab3]"
                  />
                  <span className="text-sm text-gray-600">{metodo}</span>
                </label>
              ))
            )}
          </div>

          {/* Aviso privacidad */}
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Tus datos se utilizarán para procesar tu pedido, mejorar tu experiencia, puedes leer más sobre esto en nuestra{' '}
            <Link to="/privacidad" className="text-[#9b5ab3] hover:underline">política de privacidad</Link>.
          </p>

          {/* Botón realizar pedido */}
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || crearPedido.isPending || bajominimo}
            className="w-full mt-5 py-3 bg-[#9b5ab3] hover:bg-[#7c3aed] text-white font-bold text-sm uppercase tracking-wide rounded transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {crearPedido.isPending && <Loader2 size={16} className="animate-spin" />}
            {crearPedido.isPending
              ? 'Procesando...'
              : bajominimo
              ? `Mínimo ${compraMinima} uds.`
              : 'Realizar el pedido'}
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-3">
            <ShieldCheck size={13} className="text-gray-300" />
            <p className="text-xs text-gray-400">Compra segura · Venta mayorista</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
