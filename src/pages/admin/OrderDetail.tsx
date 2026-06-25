import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, CreditCard, FileText, Clock, Truck } from 'lucide-react';
import { useOrderById, useUpdateOrderStatus } from '../../hooks/useOrders';
import { EstadoPedido } from '../../types/pedido';

// Formatea precio en pesos argentinos
const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);

// Formatea fecha a formato legible en español
const formatearFecha = (fechaStr: string) =>
  new Date(fechaStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Pasos del flujo del pedido en orden
const PASOS_ESTADO: EstadoPedido[] = [
  'pendiente',
  'confirmado',
  'en_preparacion',
  'enviado',
  'entregado',
];

// Etiquetas legibles para cada estado
const etiquetaEstado: Record<EstadoPedido, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

// Colores del badge de estado
const badgeEstado: Record<EstadoPedido, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmado: 'bg-blue-100 text-blue-700 border-blue-200',
  en_preparacion: 'bg-purple-100 text-purple-700 border-purple-200',
  enviado: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  entregado: 'bg-green-100 text-green-700 border-green-200',
  cancelado: 'bg-red-100 text-red-700 border-red-200',
};

// Lista completa de estados para el select (incluyendo cancelado)
const todosLosEstados: EstadoPedido[] = [
  'pendiente',
  'confirmado',
  'en_preparacion',
  'enviado',
  'entregado',
  'cancelado',
];

// Página de detalle de un pedido en el panel admin
const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: pedido, isLoading } = useOrderById(id!);
  const actualizarEstado = useUpdateOrderStatus();

  // Cambia el estado del pedido
  const handleCambiarEstado = async (nuevoEstado: EstadoPedido) => {
    if (!pedido) return;
    await actualizarEstado.mutateAsync({ id: pedido._id, estado: nuevoEstado });
  };

  // Índice del estado actual en el flujo (sin contar cancelado)
  const indicePasoActual = pedido ? PASOS_ESTADO.indexOf(pedido.estado) : -1;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Pedido no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header con volver ──────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/pedidos')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-rosa transition-colors"
        >
          <ArrowLeft size={16} />
          Volver a pedidos
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-marino font-mono">{pedido.numeroPedido}</h1>
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
            <Clock size={13} />
            {formatearFecha(pedido.createdAt)}
          </p>
        </div>

        {/* Badge de estado + select para cambiar */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeEstado[pedido.estado]}`}
          >
            {etiquetaEstado[pedido.estado]}
          </span>
          <select
            value={pedido.estado}
            onChange={(e) => handleCambiarEstado(e.target.value as EstadoPedido)}
            disabled={actualizarEstado.isPending}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-rosa disabled:opacity-50"
          >
            {todosLosEstados.map((estado) => (
              <option key={estado} value={estado}>
                {etiquetaEstado[estado]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Stepper de progreso (oculto si está cancelado) ─────────────── */}
      {pedido.estado !== 'cancelado' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between relative">
            {/* Línea de fondo */}
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-100 mx-8" />
            {/* Línea de progreso */}
            <div
              className="absolute left-0 top-4 h-0.5 bg-rosa mx-8 transition-all duration-500"
              style={{
                width: indicePasoActual >= 0
                  ? `calc(${(indicePasoActual / (PASOS_ESTADO.length - 1)) * 100}% - 4rem)`
                  : '0%',
              }}
            />
            {PASOS_ESTADO.map((paso, idx) => {
              const completado = idx <= indicePasoActual;
              const actual = idx === indicePasoActual;
              return (
                <div key={paso} className="flex flex-col items-center gap-1.5 relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                      ${actual ? 'bg-rosa text-white ring-4 ring-rosa/20' : ''}
                      ${completado && !actual ? 'bg-rosa text-white' : ''}
                      ${!completado ? 'bg-white border-2 border-gray-200 text-gray-300' : ''}
                    `}
                  >
                    {completado ? (actual ? idx + 1 : '✓') : idx + 1}
                  </div>
                  <span
                    className={`text-xs text-center leading-tight max-w-[68px] ${
                      completado ? 'text-marina font-medium text-marino' : 'text-gray-300'
                    }`}
                  >
                    {etiquetaEstado[paso]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Layout 2 columnas ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Columna izquierda: productos ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Productos */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
              <Package size={16} className="text-rosa" />
              <h2 className="font-semibold text-marino text-sm">Productos del pedido</h2>
            </div>
            <ul className="divide-y divide-gray-50">
              {pedido.items.map((item, i) => (
                <li key={i} className="flex items-center gap-4 px-5 py-4">
                  <img
                    src={item.imagen || '/placeholder.jpg'}
                    alt={item.nombre}
                    className="w-14 h-14 object-cover rounded-lg border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-marino truncate">{item.nombre}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {item.cantidad} unidad{item.cantidad !== 1 ? 'es' : ''} × {formatearPrecio(item.precio)}
                    </p>
                  </div>
                  <p className="font-bold text-rosa shrink-0 text-sm">
                    {formatearPrecio(item.precio * item.cantidad)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Subtotal / Total */}
            <div className="border-t border-gray-100 px-5 py-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{pedido.items.reduce((acc, item) => acc + item.cantidad, 0)} productos</span>
                <span>{formatearPrecio(pedido.total)}</span>
              </div>
              <div className="flex justify-between font-bold text-marino">
                <span>Total</span>
                <span className="text-xl text-rosa">{formatearPrecio(pedido.total)}</span>
              </div>
            </div>
          </div>

          {/* Notas (si las hay) */}
          {pedido.notas && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-rosa" />
                <h2 className="font-semibold text-marino text-sm">Notas del pedido</h2>
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
                {pedido.notas}
              </p>
            </div>
          )}
        </div>

        {/* ── Columna derecha: cliente + envío + pago ────────────────────── */}
        <div className="space-y-5">

          {/* Datos del cliente */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-rosa" />
              <h2 className="font-semibold text-marino text-sm">Cliente</h2>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-marino">{pedido.cliente.nombre}</p>
              {pedido.cliente.empresa && (
                <p className="text-gray-500">{pedido.cliente.empresa}</p>
              )}
              {pedido.cliente.dni && (
                <p className="text-gray-500">DNI/CUIL: {pedido.cliente.dni}</p>
              )}
              <p className="text-gray-500">{pedido.cliente.email}</p>
              <p className="text-gray-500">{pedido.cliente.telefono}</p>
            </div>
          </div>

          {/* Dirección de envío */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-rosa" />
              <h2 className="font-semibold text-marino text-sm">Envío</h2>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{pedido.cliente.direccion}</p>
              {pedido.cliente.ciudad !== 'Sin especificar' && (
                <p>{pedido.cliente.ciudad}, {pedido.cliente.provincia}</p>
              )}
              {pedido.cliente.codigoPostal && <p>CP: {pedido.cliente.codigoPostal}</p>}
            </div>
          </div>

          {/* Medio de envío */}
          {pedido.medioEnvio && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Truck size={16} className="text-rosa" />
                <h2 className="font-semibold text-marino text-sm">Medio de envío</h2>
              </div>
              <p className="text-sm text-gray-600">{pedido.medioEnvio}</p>
            </div>
          )}

          {/* Método de pago */}
          {pedido.metodoPago && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-rosa" />
                <h2 className="font-semibold text-marino text-sm">Método de pago</h2>
              </div>
              <p className="text-sm text-gray-600">{pedido.metodoPago}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
