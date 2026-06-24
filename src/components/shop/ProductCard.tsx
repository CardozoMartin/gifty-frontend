import { Link } from 'react-router-dom';
import { Producto } from '../../types/producto';
import { useCart } from '../../hooks/useCart';
import { useConfig } from '../../hooks/useConfig';

interface ProductCardProps {
  producto: Producto;
}

const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precio);

const ProductCard = ({ producto }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { data: config } = useConfig();

  const pctEfectivo = config?.descuentoEfectivo ?? 0;
  const precioEfectivo = pctEfectivo > 0
    ? Math.round(producto.precio * (1 - pctEfectivo / 100))
    : 0;
  const tieneDescuento = pctEfectivo > 0;

  return (
    <div className="group bg-white overflow-hidden">

      {/* Imagen */}
      <Link to={`/tienda/${producto.slug}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-gray-50">
          <img
            src={producto.imagenes[0] || '/placeholder.jpg'}
            alt={producto.nombre}
            className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-40"
          />
        </div>

        {/* Overlay con botón "+" al hacer hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full border-2 border-rosa flex items-center justify-center">
            <span className="text-rosa text-2xl leading-none mb-0.5">+</span>
          </div>
        </div>

        {/* Badge sin stock */}
        {producto.stock === 0 && (
          <span className="absolute top-2 right-2 bg-gray-600 text-white text-xs font-bold px-2 py-0.5">
            Sin stock
          </span>
        )}
      </Link>

      {/* Nombre */}
      <div className="px-3 pt-3 pb-1 text-center">
        <Link to={`/tienda/${producto.slug}`}>
          <h3 className="text-sm font-medium text-gray-800 hover:text-rosa transition-colors line-clamp-2 leading-snug">
            {producto.nombre}
          </h3>
        </Link>
      </div>

      {/* Precio de lista en rosa */}
      <div className="text-center px-3 py-1">
        <p className="text-rosa font-bold text-lg leading-tight">
          {formatearPrecio(producto.precio)}
        </p>
      </div>

      {/* Franja precio efectivo */}
      {tieneDescuento ? (
        <button
          onClick={() => addToCart(producto, 1)}
          disabled={producto.stock === 0}
          className="w-full border border-black font-bold text-gray-800 text-xs py-2 px-3 text-center hover:bg-rosa hover:text-white hover:border-rosa transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Efectivo {pctEfectivo}% Off: {formatearPrecio(precioEfectivo)}
        </button>
      ) : (
        <button
          onClick={() => addToCart(producto, 1)}
          disabled={producto.stock === 0}
          className="w-full border border-black font-bold text-gray-800 text-xs py-2 px-3 text-center hover:bg-rosa hover:text-white hover:border-rosa transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Agregar al carrito
        </button>
      )}
    </div>
  );
};

export default ProductCard;
