import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from '../services/orderService';
import { CrearPedidoInput, EstadoPedido } from '../types/pedido';

// Claves de caché para pedidos
const PEDIDO_KEYS = {
  pedidos: 'pedidos',
  pedidoId: (id: string) => ['pedido', id],
};

// Hook para listar todos los pedidos en el admin (con filtro opcional por estado)
export const useOrders = (estado?: EstadoPedido) => {
  return useQuery({
    queryKey: [PEDIDO_KEYS.pedidos, estado],
    queryFn: () => getOrders(estado),
  });
};

// Hook para obtener el detalle de un pedido por ID
export const useOrderById = (id: string) => {
  return useQuery({
    queryKey: PEDIDO_KEYS.pedidoId(id),
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });
};

// Hook para crear un pedido desde el checkout
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos: CrearPedidoInput) => createOrder(datos),
    onSuccess: () => {
      // Invalida la lista de pedidos para que el admin vea el nuevo pedido
      queryClient.invalidateQueries({ queryKey: [PEDIDO_KEYS.pedidos] });
    },
  });
};

// Hook para actualizar el estado de un pedido desde el admin
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoPedido }) =>
      updateOrderStatus(id, estado),
    onSuccess: (_data, variables) => {
      // Invalida el pedido específico y la lista general
      queryClient.invalidateQueries({ queryKey: PEDIDO_KEYS.pedidoId(variables.id) });
      queryClient.invalidateQueries({ queryKey: [PEDIDO_KEYS.pedidos] });
    },
  });
};
