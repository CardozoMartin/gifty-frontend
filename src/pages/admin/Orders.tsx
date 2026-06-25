import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders, useUpdateOrderStatus } from '../../hooks/useOrders';
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
  const navigate = useNavigate();

  const { data: pedidos, isLoading } = useOrders(filtroEstado);
  const actualizarEstado = useUpdateOrderStatus();

  // Cambia el estado de un pedido desde el select de la tabla
  const handleCambiarEstado = async (id: string, nuevoEstado: EstadoPedido) => {
    await actualizarEstado.mutateAsync({ id, estado: nuevoEstado });
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
                        onClick={() => navigate(`/admin/pedidos/${pedido._id}`)}
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
    </div>
  );
};

export default AdminOrders;
