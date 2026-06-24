import api from './api';
import { Pedido, CrearPedidoInput, EstadoPedido } from '../types/pedido';

interface RespuestaApi<T> {
  ok: boolean;
  datos: T;
}

// Obtiene todos los pedidos para el panel admin
export const getOrders = async (estado?: EstadoPedido): Promise<Pedido[]> => {
  const params: Record<string, string> = {};
  if (estado) params.estado = estado;

  const respuesta = await api.get<RespuestaApi<Pedido[]>>('/pedidos/admin', { params });
  return respuesta.data.datos;
};

// Obtiene el detalle de un pedido por ID
export const getOrderById = async (id: string): Promise<Pedido> => {
  const respuesta = await api.get<RespuestaApi<Pedido>>(`/pedidos/admin/${id}`);
  return respuesta.data.datos;
};

// Crea un pedido nuevo desde el checkout de la tienda
export const createOrder = async (datos: CrearPedidoInput): Promise<Pedido> => {
  const respuesta = await api.post<RespuestaApi<Pedido>>('/pedidos', datos);
  return respuesta.data.datos;
};

// Actualiza el estado de un pedido desde el admin
export const updateOrderStatus = async (
  id: string,
  estado: EstadoPedido
): Promise<Pedido> => {
  const respuesta = await api.patch<RespuestaApi<Pedido>>(
    `/pedidos/admin/${id}/estado`,
    { estado }
  );
  return respuesta.data.datos;
};
