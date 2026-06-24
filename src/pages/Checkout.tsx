import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, LogIn, Loader2, ShieldCheck, Tag, AlertTriangle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useCreateOrder } from '../hooks/useOrders';
import { useUserAuthStore } from '../store/userAuthStore';
import { useConfig } from '../hooks/useConfig';
import { DatosCliente } from '../types/pedido';

type FormData = DatosCliente & { notas?: string };

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

const metodosPagoOpciones = [
  { valor: 'transferencia', label: 'Transferencia bancaria', desc: 'Datos al confirmar el pedido' },
  { valor: 'efectivo',      label: 'Efectivo',               desc: '¡Precio especial con descuento!' },
  { valor: 'mercadopago',   label: 'Mercado Pago',           desc: 'Link de pago al confirmar' },
];

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-rosa focus:ring-2 focus:ring-rosa/10 transition-colors';
const labelCls = 'block text-sm font-medium text-gray-600 mb-1.5';

const Checkout = () => {
  const { items, vaciarCarrito } = useCart();
  const crearPedido = useCreateOrder();
  const { usuario, estaAutenticado } = useUserAuthStore();
  const { data: config } = useConfig();

  const [metodoPago, setMetodoPago] = useState('transferencia');
  const [pedidoConfirmado, setPedidoConfirmado] = useState<string | null>(null);
  const esEfectivo = metodoPago === 'efectivo';

  // ── Totales y descuentos ──────────────────────────────────────────────────
  const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0);
  const pctEfectivo = config?.descuentoEfectivo ?? 0;

  // Precio unitario según método de pago: efectivo aplica % global sobre precio de lista
  const precioUnitario = (precioLista: number) =>
    esEfectivo && pctEfectivo > 0
      ? Math.round(precioLista * (1 - pctEfectivo / 100))
      : precioLista;

  const subtotal = items.reduce(
    (acc, item) => acc + precioUnitario(item.producto.precio) * item.cantidad, 0
  );

  // Busca el mayor descuento por monto que aplica sobre el subtotal
  const descuentoAplicable = config?.descuentos
    ?.filter((d) => subtotal >= d.montoDesde)
    .sort((a, b) => b.porcentaje - a.porcentaje)[0] ?? null;

  const montoDescuento = descuentoAplicable
    ? Math.round(subtotal * descuentoAplicable.porcentaje / 100)
    : 0;

  const total = subtotal - montoDescuento;

  // Validación de compra mínima
  const compraMinima = config?.compraMinima ?? 0;
  const bajominimo = compraMinima > 0 && cantidadTotal < compraMinima;

  const itemsParaPedido = items.map((item) => ({
    productoId: item.producto._id,
    nombre: item.producto.nombre,
    precio: precioUnitario(item.producto.precio),
    cantidad: item.cantidad,
    imagen: item.producto.imagenes[0] || '',
  }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    const entrega = localStorage.getItem('gifty-datos-entrega');
    const datosEntrega = entrega ? JSON.parse(entrega) : {};
    if (usuario) {
      reset({ nombre: usuario.nombre, email: usuario.email, ...datosEntrega });
    } else if (entrega) {
      reset(datosEntrega);
    }
  }, [usuario, reset]);

  if (items.length === 0 && !pedidoConfirmado) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Tu carrito está vacío.</p>
        <Link to="/tienda" className="btn-primario">Ir a la tienda</Link>
      </div>
    );
  }

  const onSubmit = async (datos: FormData) => {
    const { notas, ...cliente } = datos;
    const pedido = await crearPedido.mutateAsync({
      cliente,
      items: itemsParaPedido,
      metodoPago,
      notas,
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

  // ── Formulario de checkout ────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/tienda" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-rosa mb-6">
        <ChevronLeft size={16} /> Volver a la tienda
      </Link>

      <h1 className="text-2xl font-bold text-marino mb-6">Finalizar compra</h1>

      {/* Alerta de compra mínima */}
      {bajominimo && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-6">
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

      {/* Banner para usuario no logueado */}
      {!estaAutenticado && (
        <div className="flex items-center justify-between bg-rosa-suave border border-rosa/20 rounded-xl px-5 py-3.5 mb-6">
          <div className="flex items-center gap-3">
            <LogIn size={18} className="text-rosa shrink-0" />
            <p className="text-sm text-gray-700">
              <span className="font-semibold">¿Tenés cuenta?</span> Iniciá sesión para guardar tu historial de pedidos y precompletar tus datos.
            </p>
          </div>
          <Link
            to="/cuenta-mayorista"
            className="text-xs font-semibold text-white bg-rosa px-4 py-2 rounded-lg shrink-0 ml-4 hover:opacity-90 transition-opacity"
          >
            Ingresar
          </Link>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-3 lg:gap-10">

        {/* ── Formulario ── 2 columnas ─────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-5">

          {/* Datos personales */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-marino mb-5">Datos personales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Nombre completo <span className="text-rosa">*</span></label>
                <input {...register('nombre', { required: 'El nombre es obligatorio' })} placeholder="María González" className={inputCls} />
                {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Email <span className="text-rosa">*</span></label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'El email es obligatorio',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                  })}
                  placeholder="tu@email.com"
                  className={inputCls}
                  readOnly={!!usuario}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Teléfono / WhatsApp <span className="text-rosa">*</span></label>
                <input {...register('telefono', { required: 'El teléfono es obligatorio' })} placeholder="11 1234-5678" className={inputCls} />
                {errors.telefono && <p className="text-red-400 text-xs mt-1">{errors.telefono.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Empresa / Negocio <span className="text-gray-400 font-normal text-xs">(opcional)</span></label>
                <input {...register('empresa')} placeholder="Nombre de tu negocio" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-marino mb-5">Dirección de entrega</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Dirección <span className="text-rosa">*</span></label>
                <input {...register('direccion', { required: 'La dirección es obligatoria' })} placeholder="Av. Corrientes 1234" className={inputCls} />
                {errors.direccion && <p className="text-red-400 text-xs mt-1">{errors.direccion.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Ciudad <span className="text-rosa">*</span></label>
                <input {...register('ciudad', { required: 'La ciudad es obligatoria' })} placeholder="Buenos Aires" className={inputCls} />
                {errors.ciudad && <p className="text-red-400 text-xs mt-1">{errors.ciudad.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Provincia <span className="text-rosa">*</span></label>
                <input {...register('provincia', { required: 'La provincia es obligatoria' })} placeholder="CABA" className={inputCls} />
                {errors.provincia && <p className="text-red-400 text-xs mt-1">{errors.provincia.message}</p>}
              </div>
            </div>
          </div>

          {/* Método de pago */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-marino mb-5">Método de pago</h2>
            <div className="space-y-2.5">
              {metodosPagoOpciones.map((m) => (
                <label
                  key={m.valor}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    metodoPago === m.valor ? 'border-rosa bg-rosa-suave' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value={m.valor}
                    checked={metodoPago === m.valor}
                    onChange={() => setMetodoPago(m.valor)}
                    className="accent-rosa"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-marino">{m.label}</p>
                    <p className={`text-xs mt-0.5 ${m.valor === 'efectivo' ? 'text-rosa font-semibold' : 'text-gray-400'}`}>{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <label className={labelCls}>
              Notas adicionales <span className="text-gray-400 font-normal text-xs">(opcional)</span>
            </label>
            <textarea
              {...register('notas')}
              rows={3}
              placeholder="Instrucciones de entrega, horarios, aclaraciones..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {crearPedido.isError && (
            <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-3">
              {crearPedido.error?.message || 'Error al procesar el pedido'}
            </p>
          )}

          {/* Botón móvil */}
          <button
            type="submit"
            disabled={isSubmitting || crearPedido.isPending || bajominimo}
            className="w-full flex items-center justify-center gap-2 btn-primario py-3 text-base lg:hidden disabled:opacity-60"
          >
            {crearPedido.isPending && <Loader2 size={16} className="animate-spin" />}
            {crearPedido.isPending ? 'Procesando...' : 'Confirmar pedido'}
          </button>
        </form>

        {/* ── Resumen — columna derecha ────────────────────────────────────── */}
        <div className="mt-6 lg:mt-0">
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-bold text-marino mb-4">Resumen</h2>

            <ul className="space-y-3 mb-4">
              {items.map((item) => {
                const precio = precioUnitario(item.producto.precio);
                return (
                  <li key={item.producto._id} className="flex gap-3 items-start">
                    <img
                      src={item.producto.imagenes[0] || '/placeholder.jpg'}
                      alt={item.producto.nombre}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-marino truncate">{item.producto.nombre}</p>
                      <p className="text-xs text-gray-400">{item.cantidad} × {fmt(precio)}</p>
                    </div>
                    <p className="text-xs font-semibold text-rosa shrink-0">{fmt(precio * item.cantidad)}</p>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>

              {/* Descuento automático por monto */}
              {descuentoAplicable && (
                <div className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <Tag size={13} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">
                      Descuento {descuentoAplicable.porcentaje}% OFF
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">−{fmt(montoDescuento)}</span>
                </div>
              )}

              {esEfectivo && pctEfectivo > 0 && (
                <div className="flex items-center justify-between bg-rosa-suave rounded-lg px-3 py-2">
                  <span className="text-xs font-semibold text-rosa">{pctEfectivo}% OFF por pago en efectivo</span>
                  <span className="text-xs text-rosa">✓</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-500">
                <span>Envío</span>
                <span className="text-emerald-600 font-medium">A coordinar</span>
              </div>

              <div className="flex justify-between text-base font-bold text-marino pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-rosa">{fmt(total)}</span>
              </div>

              {/* Próximo descuento disponible */}
              {config?.descuentos && config.descuentos.length > 0 && (() => {
                const siguiente = config.descuentos
                  .filter((d) => subtotal < d.montoDesde)
                  .sort((a, b) => a.montoDesde - b.montoDesde)[0];
                if (!siguiente) return null;
                const falta = siguiente.montoDesde - subtotal;
                return (
                  <p className="text-xs text-gray-400 text-center pt-1">
                    Agregá <span className="font-semibold text-rosa">{fmt(falta)}</span> más para obtener{' '}
                    <span className="font-semibold text-emerald-600">{siguiente.porcentaje}% de descuento</span>
                  </p>
                );
              })()}
            </div>

            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || crearPedido.isPending || bajominimo}
              className="w-full items-center justify-center gap-2 btn-primario mt-5 py-3 hidden lg:flex disabled:opacity-60"
            >
              {crearPedido.isPending && <Loader2 size={16} className="animate-spin" />}
              {crearPedido.isPending ? 'Procesando...' : bajominimo ? `Mínimo ${compraMinima} uds.` : 'Confirmar pedido'}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3">
              <ShieldCheck size={13} className="text-gray-300" />
              <p className="text-xs text-gray-400">Compra segura · Venta mayorista</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
