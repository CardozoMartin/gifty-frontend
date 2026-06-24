import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';
import CategoryGrid from '../components/shop/CategoryGrid';
import ProductCard from '../components/shop/ProductCard';
import { useProducts } from '../hooks/useProducts';
import heroImg from '../img/hero.png';

// Página de inicio: Hero + Categorías + Sección Novedades
const Home = () => {
  // Cargamos los últimos productos para la sección novedades
  const { data: productos, isLoading } = useProducts();

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden h-[60vh] sm:h-[75vh] lg:h-[82vh]">
        {/* Imagen de fondo de la tienda — ocupa todo el hero */}
        <img
          src={heroImg}
          alt="Gifty tienda"
          className="absolute inset-0 w-full h-full object-cover object-center scale-110"
        />
        {/* Overlay suave para que el texto se lea sin tapar demasiado la foto */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Texto centrado verticalmente igual al diseño original */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          {/* Título — sube desde abajo al cargar */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl mb-3 sm:mb-4 drop-shadow-lg leading-tight animate-slide-up"
            style={{ fontFamily: '"Satisfy", cursive', fontWeight: 400 }}
          >
            ¡Bienvenidos a Gifty!
          </h1>

          {/* Subtítulo — sube con delay */}
          <p className="text-sm sm:text-lg font-light mb-6 sm:mb-8 drop-shadow tracking-wide animate-slide-up-delay-1">
            No regalés sólo cosas, regalá emociones
          </p>

          {/* Botón — sube con más delay */}
          <Link
            to="/tienda"
            className="group relative overflow-hidden text-white font-semibold px-10 py-3 uppercase tracking-widest text-xs shadow-md border border-white hover:border-transparent transition-all duration-300 flex items-center justify-center animate-slide-up-delay-2"
            style={{ minWidth: '180px', backgroundColor: '#FF77EC' }}
          >
            {/* Texto encima con z-index mayor */}
            <span className="relative z-10">IR A LA TIENDA</span>

            {/* Ícono arranca centrado detrás del texto (z-0) y se desliza a la derecha al hover */}
            <span className="absolute z-0 translate-x-0 opacity-0 group-hover:translate-x-16 group-hover:opacity-100 transition-all duration-500 ease-out flex items-center">
              <Gift strokeWidth={1.5} style={{ width: '1.1rem', height: '1.1rem' }} />
            </span>
          </Link>
        </div>
      </section>

      {/* ── Grid de categorías ───────────────────────────────────────────── */}
      <CategoryGrid />

      {/* ── Sección Novedades ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold text-marino text-center mb-8 tracking-wide">
          NOVEDADES
        </h2>

        {/* Estado de carga */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Grid de productos */}
        {productos && productos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Mostramos los primeros 8 como novedades */}
            {productos.slice(0, 8).map((producto) => (
              <ProductCard key={producto._id} producto={producto} />
            ))}
          </div>
        )}

        {/* Sin productos aún */}
        {!isLoading && (!productos || productos.length === 0) && (
          <p className="text-center text-gray-400 py-12">
            Próximamente nuevos productos
          </p>
        )}

        {/* Botón para ver toda la tienda */}
        {productos && productos.length > 0 && (
          <div className="text-center mt-10">
            <Link to="/tienda" className="btn-secundario">
              Ver todos los productos
            </Link>
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;
