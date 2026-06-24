import { X, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

// Formatea un número como precio en pesos argentinos
const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);

// Sidebar lateral del carrito — se desliza desde la derecha
const CartSidebar = () => {
  const {
    items,
    estaAbierto,
    total,
    cerrarCarrito,
    quitarItem,
    actualizarCantidad,
  } = useCart();

  return (
    <>
      {/* Overlay oscuro detrás del carrito */}
      {estaAbierto && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={cerrarCarrito}
        />
      )}

      {/* Panel lateral del carrito */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          estaAbierto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header del carrito */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-marino">
            CARRITO DE COMPRAS ({items.length})
          </h2>
          <button
            onClick={cerrarCarrito}
            className="text-gray-400 hover:text-rosa transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={22} />
          </button>
        </div>

        {/* Lista de ítems del carrito */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            // Estado vacío
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag size={48} className="mb-3 opacity-30" />
              <p className="text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.producto._id} className="flex gap-3 items-start">
                {/* Imagen del producto */}
                <img
                  src={item.producto.imagenes[0] || '/placeholder.jpg'}
                  alt={item.producto.nombre}
                  className="w-16 h-16 object-cover rounded border border-gray-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-marino truncate">
                    {item.producto.nombre}
                  </p>
                  <p className="text-rosa font-bold text-sm">
                    {formatearPrecio(item.producto.precio)}
                  </p>

                  {/* Selector de cantidad */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        actualizarCantidad(item.producto._id, item.cantidad - 1)
                      }
                      className="w-6 h-6 border border-gray-300 rounded text-sm flex items-center justify-center hover:border-rosa hover:text-rosa"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-6 text-center">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() =>
                        actualizarCantidad(item.producto._id, item.cantidad + 1)
                      }
                      className="w-6 h-6 border border-gray-300 rounded text-sm flex items-center justify-center hover:border-rosa hover:text-rosa"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Botón eliminar ítem */}
                <button
                  onClick={() => quitarItem(item.producto._id)}
                  className="text-gray-300 hover:text-rosa transition-colors mt-1"
                  aria-label="Quitar del carrito"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer del carrito con total y botón de compra */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex justify-between text-base font-bold text-marino">
              <span>Total</span>
              <span>{formatearPrecio(total)}</span>
            </div>

            <Link
              to="/checkout"
              onClick={cerrarCarrito}
              className="btn-primario w-full text-center block text-sm"
            >
              COMPRAR
            </Link>

            <button
              onClick={cerrarCarrito}
              className="w-full text-center text-sm text-rosa hover:underline"
            >
              Seguir viendo
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
