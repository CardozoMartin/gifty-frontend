import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Producto } from '../types/producto';
import { ItemPedido } from '../types/pedido';

// Ítem del carrito: producto + cantidad seleccionada
interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

// Estado global del carrito con sus acciones
interface CarritoStore {
  items: ItemCarrito[];
  estaAbierto: boolean;                                  // controla si el sidebar está visible
  agregarItem: (producto: Producto, cantidad: number) => void;
  quitarItem: (productoId: string) => void;
  actualizarCantidad: (productoId: string, cantidad: number) => void;
  vaciarCarrito: () => void;
  abrirCarrito: () => void;
  cerrarCarrito: () => void;
  // Computed: convierte los items del store al formato que espera la API
  getItemsParaPedido: () => ItemPedido[];
  // Computed: calcula el total del carrito
  getTotal: () => number;
  // Computed: cuenta la cantidad total de productos
  getCantidadTotal: () => number;
}

// Creamos el store con persistencia en localStorage para no perder el carrito al recargar
export const useCartStore = create<CarritoStore>()(
  persist(
    (set, get) => ({
      items: [],
      estaAbierto: false,

      // Agrega un producto al carrito; si ya existe, suma la cantidad
      agregarItem: (producto, cantidad) => {
        set((estado) => {
          const itemExistente = estado.items.find(
            (item) => item.producto._id === producto._id
          );

          if (itemExistente) {
            // Actualiza la cantidad del ítem existente
            return {
              items: estado.items.map((item) =>
                item.producto._id === producto._id
                  ? { ...item, cantidad: item.cantidad + cantidad }
                  : item
              ),
              estaAbierto: true, // abre el carrito al agregar un producto
            };
          }

          // Agrega el nuevo ítem y abre el sidebar
          return {
            items: [...estado.items, { producto, cantidad }],
            estaAbierto: true,
          };
        });
      },

      // Elimina un ítem del carrito por ID de producto
      quitarItem: (productoId) => {
        set((estado) => ({
          items: estado.items.filter((item) => item.producto._id !== productoId),
        }));
      },

      // Cambia la cantidad de un ítem; si llega a 0 lo elimina
      actualizarCantidad: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().quitarItem(productoId);
          return;
        }

        set((estado) => ({
          items: estado.items.map((item) =>
            item.producto._id === productoId ? { ...item, cantidad } : item
          ),
        }));
      },

      // Vacía el carrito por completo
      vaciarCarrito: () => set({ items: [] }),

      abrirCarrito: () => set({ estaAbierto: true }),
      cerrarCarrito: () => set({ estaAbierto: false }),

      // Convierte los items del carrito al formato ItemPedido para enviarlo a la API
      getItemsParaPedido: () => {
        return get().items.map((item) => ({
          productoId: item.producto._id,
          nombre: item.producto.nombre,
          precio: item.producto.precio,
          cantidad: item.cantidad,
          imagen: item.producto.imagenes[0] || '',
        }));
      },

      // Suma precio × cantidad de cada ítem
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.producto.precio * item.cantidad,
          0
        );
      },

      // Cantidad total de unidades en el carrito
      getCantidadTotal: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },
    }),
    {
      name: 'gifty-carrito', // clave en localStorage
    }
  )
);
