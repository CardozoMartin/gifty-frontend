import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Gift } from 'lucide-react';
import { useProductBySlug, useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useConfig } from '../hooks/useConfig';
import ProductCard from '../components/shop/ProductCard';


// Acordeón con transición suave de altura
const Acordeon = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => {
  const [abierto, setAbierto] = useState(false);
  const contenidoRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between py-3 text-sm text-gray-500 hover:text-rosa transition-colors"
      >
        <span>{titulo}</span>
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 transition-transform duration-300"
          style={{ background: '#FF77EC', transform: abierto ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          +
        </span>
      </button>
      {/* Contenedor con altura animada */}
      <div
        ref={contenidoRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: abierto ? `${contenidoRef.current?.scrollHeight ?? 500}px` : '0px',
          opacity: abierto ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Formatea precio en pesos argentinos
const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);

// Página de detalle de producto — replica el diseño del sitio original
const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: producto, isLoading, isError } = useProductBySlug(slug || '');
  const { addToCart } = useCart();
  const { data: config } = useConfig();

  // Índice de la imagen principal mostrada
  const { data: relacionados } = useProducts(producto?.categoria);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [posZoom, setPosZoom] = useState({ x: 50, y: 50 });
  const [zoomActivo, setZoomActivo] = useState(false);
  const imagenRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imagenRef.current) return;
    const rect = imagenRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosZoom({ x, y });
  };
  // Cantidad a agregar al carrito
  const [cantidad, setCantidad] = useState(1);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="md:grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          <div className="space-y-4 mt-6 md:mt-0">
            <div className="h-6 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-8 bg-gray-100 rounded animate-pulse w-1/3" />
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !producto) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Producto no encontrado.</p>
        <Link to="/tienda" className="btn-primario">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  // Descuento efectivo desde la config global
  const pctEfectivo = config?.descuentoEfectivo ?? 0;
  const precioEfectivo = pctEfectivo > 0
    ? Math.round(producto.precio * (1 - pctEfectivo / 100))
    : 0;
  const porcentajeDescuento = pctEfectivo;

  const handleCantidadChange = (valor: number) => {
    setCantidad(Math.max(valor, 1));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Link
        to="/tienda"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-rosa mb-6"
      >
        <ChevronLeft size={16} />
        Volver a la tienda
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* ── Galería de imágenes ──────────────────────────────────────── */}
        <div className="max-w-xs mx-auto md:max-w-none">
          {/* Imagen principal con zoom inline al hover — solo desktop */}
          <div
            ref={imagenRef}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 md:cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setZoomActivo(true)}
            onMouseLeave={() => setZoomActivo(false)}
          >
            <img
              src={producto.imagenes[imagenActiva] || '/placeholder.jpg'}
              alt={producto.nombre}
              className="w-full h-full object-cover transition-transform duration-150"
              style={{
                transformOrigin: `${posZoom.x}% ${posZoom.y}%`,
                transform: zoomActivo ? 'scale(2.2)' : 'scale(1)',
              }}
            />
          </div>

          {/* Miniaturas si hay más de una imagen */}
          {producto.imagenes.length > 1 && (
            <div className="flex gap-2 mt-3">
              {producto.imagenes.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImagenActiva(i)}
                  className={`w-16 h-16 rounded border-2 overflow-hidden transition-colors ${
                    imagenActiva === i ? 'border-rosa' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Acordeones debajo de la imagen */}
          {config && (
            <div className="border-t border-gray-200 mt-6">
              <Acordeon titulo="Métodos de pago">
                <ul className="space-y-1 py-3 px-1">
                  {config.metodosPago.map((m, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-rosa">-</span>{m}
                    </li>
                  ))}
                </ul>
              </Acordeon>
              <Acordeon titulo="Medios de Envío">
                <ul className="space-y-1 py-3 px-1">
                  {config.mediosEnvio.map((e, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-rosa">–</span>{e}
                    </li>
                  ))}
                </ul>
                {config.notaEnvio && (
                  <p className="text-xs text-gray-500 font-semibold uppercase leading-relaxed pb-3 px-1">
                    {config.notaEnvio}
                  </p>
                )}
              </Acordeon>
            </div>
          )}
        </div>

        {/* ── Info del producto ─────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-marino mb-3">{producto.nombre}</h1>

          {/* Precio principal */}
          <p className="text-3xl font-bold text-rosa mb-1">
            {formatearPrecio(producto.precio)}
          </p>

          {/* Precio con descuento efectivo */}
          {porcentajeDescuento > 0 && (
            <p className="text-sm text-gray-600 mb-4">
              <span className="border border-black text-gray-800 text-xs font-bold px-2 py-0.5 mr-2">
                Efectivo {porcentajeDescuento}% Off:
              </span>
              <strong>{formatearPrecio(precioEfectivo)}</strong>
            </p>
          )}

          {/* Stock */}
          {producto.stock > 0 && producto.stock <= 10 && (
            <p className="text-sm font-bold text-rosa mb-4">
              Solo quedan {producto.stock} disponibles
            </p>
          )}

          {/* Descripción */}
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {producto.descripcion}
          </p>

          {/* Selector de cantidad + botón agregar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              {/* Control de cantidad */}
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => handleCantidadChange(cantidad - 1)}
                  className="px-3 py-2 text-marino hover:text-rosa"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-medium">{cantidad}</span>
                <button
                  onClick={() => handleCantidadChange(cantidad + 1)}
                  className="px-3 py-2 text-marino hover:text-rosa"
                >
                  +
                </button>
              </div>

              {/* Botón añadir al carrito — mismo estilo y hover que el hero */}
              <button
                onClick={() => addToCart(producto, cantidad)}
                className="group relative overflow-hidden flex-1 flex items-center justify-center text-white font-semibold py-3 uppercase tracking-widest text-xs transition-all duration-300"
                style={{ backgroundColor: '#FF77EC' }}
              >
                <span className="relative z-10">AÑADIR AL CARRITO</span>
                <span className="absolute z-0 translate-x-0 opacity-0 group-hover:translate-x-20 group-hover:opacity-100 transition-all duration-500 ease-out flex items-center">
                  <Gift strokeWidth={1.5} style={{ width: '1.1rem', height: '1.1rem' }} />
                </span>
              </button>
            </div>

          {/* Categoría */}
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-6">
            Categoría: <span className="capitalize">{producto.categoria}</span>
          </p>

        </div>
      </div>

      {/* Productos relacionados */}
      {relacionados && relacionados.filter(p => p._id !== producto._id).length > 0 && (
        <>
          <div className="w-full h-px mt-12 mb-8" style={{ background: '#FF77EC', opacity: 0.4 }} />
          <section>
            <h2 className="text-lg font-bold text-marino mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {relacionados
                .filter(p => p._id !== producto._id)
                .slice(0, 5)
                .map(p => (
                  <ProductCard key={p._id} producto={p} />
                ))}
            </div>
          </section>
        </>
      )}

    </div>
  );
};

export default ProductDetail;
