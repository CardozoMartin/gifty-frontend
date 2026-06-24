// Estados posibles de un pedido
export type EstadoPedido =
  | 'pendiente'
  | 'confirmado'
  | 'en_preparacion'
  | 'enviado'
  | 'entregado'
  | 'cancelado';

// Un ítem dentro del pedido
export interface ItemPedido {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

// Datos del cliente al hacer el pedido
export interface DatosCliente {
  nombre: string;
  email: string;
  telefono: string;
  empresa?: string;
  direccion: string;
  ciudad: string;
  provincia: string;
}

// Pedido completo tal como llega desde la API
export interface Pedido {
  _id: string;
  numeroPedido: string;
  cliente: DatosCliente;
  items: ItemPedido[];
  total: number;
  estado: EstadoPedido;
  metodoPago?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

// Datos para crear un nuevo pedido desde el checkout
export interface CrearPedidoInput {
  cliente: DatosCliente;
  items: ItemPedido[];
  metodoPago?: string;
  notas?: string;
}
