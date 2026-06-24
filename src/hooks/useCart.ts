import { useCartStore } from '../store/cartStore';
import { Producto } from '../types/producto';

// Hook que expone el carrito de forma cómoda a los componentes
// Centraliza el acceso al store de Zustand con selectores optimizados
export const useCart = () => {
  const items = useCartStore((s) => s.items);
  const estaAbierto = useCartStore((s) => s.estaAbierto);
  const agregarItem = useCartStore((s) => s.agregarItem);
  const quitarItem = useCartStore((s) => s.quitarItem);
  const actualizarCantidad = useCartStore((s) => s.actualizarCantidad);
  const vaciarCarrito = useCartStore((s) => s.vaciarCarrito);
  const abrirCarrito = useCartStore((s) => s.abrirCarrito);
  const cerrarCarrito = useCartStore((s) => s.cerrarCarrito);
  const getItemsParaPedido = useCartStore((s) => s.getItemsParaPedido);
  const getTotal = useCartStore((s) => s.getTotal);
  const getCantidadTotal = useCartStore((s) => s.getCantidadTotal);

  // Wrapper que agrega un producto respetando la cantidad mínima mayorista
  const addToCart = (producto: Producto, cantidad: number) => {
    const cantidadFinal = Math.max(cantidad, producto.cantidadMinima);
    agregarItem(producto, cantidadFinal);
  };

  return {
    items,
    estaAbierto,
    total: getTotal(),
    cantidadTotal: getCantidadTotal(),
    itemsParaPedido: getItemsParaPedido(),
    addToCart,
    quitarItem,
    actualizarCantidad,
    vaciarCarrito,
    abrirCarrito,
    cerrarCarrito,
  };
};
