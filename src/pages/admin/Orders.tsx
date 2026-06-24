import { useState } from 'react';
import { X } from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '../../hooks/useOrders';
import { Pedido, EstadoPedido } from '../../types/pedido';

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

// Colores de badge por estado del pedido
const badgeEstado: Record<EstadoPedido, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  confirmado: 'bg-blue-100 text-blue-700',
  en_preparacion: 'bg-purple-100 text-purple-700',
  enviado: 'bg-indigo-100 text-indigo-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
};

// Lista de estados para el select de cambio de estado
const estadosDisponibles: EstadoPedido[] = [
  'pendiente',
  'confirmado',
  'en_preparacion',
  'enviado',
  'entregado',
  'cancelado',
];

// Página de gestión de pedidos en el panel admin
const AdminOrders = () => {
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | undefined>(undefined);
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);

  const { data: pedidos, isLoading } = useOrders(filtroEstado);
  const actualizarEstado = useUpdateOrderStatus();

  // Cambia el estado de un pedido desde el select de la tabla
  const handleCambiarEstado = async (id: string, nuevoEstado: EstadoPedido) => {
    await actualizarEstado.mutateAsync({ id, estado: nuevoEstado });
    // Si el pedido está abierto en detalle, actualizamos el estado local
    if (pedidoDetalle?._id === id) {
      setPedidoDetalle((prev) => prev ? { ...prev, estado: nuevoEstado } : null);
    }
  };

  return (
    <div>
      {/* Header con filtro de estado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-marino">Pedidos</h1>

        {/* Filtro por estado */}
        <select
          value={filtroEstado || ''}
          onChange={(e) => setFiltroEstado((e.target.value as EstadoPedido) || undefined)}
          className="border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-rosa"
        >
          <option value="">Todos los estados</option>
          {estadosDisponibles.map((estado) => (
            <option key={estado} value={estado} className="capitalize">
              {estado.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de pedidos */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">N° Pedido</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Fecha</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Total</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Estado</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pedidos?.map((pedido) => (
                  <tr key={pedido._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-marino">
                      {pedido.numeroPedido}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-marino">{pedido.cliente.nombre}</p>
                      <p className="text-gray-400 text-xs">{pedido.cliente.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatearFecha(pedido.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rosa">
                      {formatearPrecio(pedido.total)}
                    </td>
                    <td className="px-4 py-3">
                      {/* Select para cambiar el estado directamente desde la tabla */}
                      <select
                        value={pedido.estado}
                        onChange={(e) =>
                          handleCambiarEstado(pedido._id, e.target.value as EstadoPedido)
                        }
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer ${badgeEstado[pedido.estado]}`}
                      >
                        {estadosDisponibles.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setPedidoDetalle(pedido)}
                        className="text-xs text-rosa hover:underline"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Sin pedidos */}
            {(!pedidos || pedidos.length === 0) && (
              <div className="text-center py-12 text-gray-400">
                <p>No hay pedidos {filtroEstado ? `con estado "${filtroEstado}"` : 'aún'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal de detalle del pedido ──────────────────────────────────── */}
      {pedidoDetalle && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setPedidoDetalle(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header del modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-marino font-mono">
                    {pedidoDetalle.numeroPedido}
                  </h2>
                  <p className="text-xs text-gray-400">{formatearFecha(pedidoDetalle.createdAt)}</p>
                </div>
                <button
                  onClick={() => setPedidoDetalle(null)}
                  className="text-gray-400 hover:text-rosa"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Datos del cliente */}
                <div>
                  <h3 className="text-sm font-semibold text-marino mb-2">Datos del cliente</h3>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                    <p><span className="text-gray-500">Nombre:</span> {pedidoDetalle.cliente.nombre}</p>
                    <p><span className="text-gray-500">Email:</span> {pedidoDetalle.cliente.email}</p>
                    <p><span className="text-gray-500">Teléfono:</span> {pedidoDetalle.cliente.telefono}</p>
                    {pedidoDetalle.cliente.empresa && (
                      <p><span className="text-gray-500">Empresa:</span> {pedidoDetalle.cliente.empresa}</p>
                    )}
                    <p>
                      <span className="text-gray-500">Dirección:</span>{' '}
                      {pedidoDetalle.cliente.direccion}, {pedidoDetalle.cliente.ciudad},{' '}
                      {pedidoDetalle.cliente.provincia}
                    </p>
                  </div>
                </div>

                {/* Ítems del pedido */}
                <div>
                  <h3 className="text-sm font-semibold text-marino mb-2">Productos</h3>
                  <ul className="space-y-2">
                    {pedidoDetalle.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <img
                          src={item.imagen || '/placeholder.jpg'}
                          alt={item.nombre}
                          className="w-10 h-10 object-cover rounded border border-gray-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-marino truncate">{item.nombre}</p>
                          <p className="text-gray-400 text-xs">
                            {item.cantidad} × {formatearPrecio(item.precio)}
                          </p>
                        </div>
                        <p className="font-semibold text-rosa shrink-0">
                          {formatearPrecio(item.precio * item.cantidad)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                  <span className="font-bold text-marino">Total</span>
                  <span className="text-xl font-bold text-rosa">
                    {formatearPrecio(pedidoDetalle.total)}
                  </span>
                </div>

                {/* Notas */}
                {pedidoDetalle.notas && (
                  <div>
                    <h3 className="text-sm font-semibold text-marino mb-1">Notas</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">
                      {pedidoDetalle.notas}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOrders;
