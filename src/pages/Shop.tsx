import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/shop/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { Categoria } from '../types/producto';

// Lista de categorías para el filtro lateral
const listaCategorias: { label: string; valor: Categoria | '' }[] = [
  { label: 'Todos', valor: '' },
  { label: 'Tazas', valor: 'tazas' },
  { label: 'Mates', valor: 'mates' },
  { label: 'Botellas', valor: 'botellas' },
  { label: 'Librería', valor: 'libreria' },
  { label: 'Box', valor: 'box' },
  { label: 'Cotillón', valor: 'cotillon' },
  { label: 'Otros', valor: 'otros' },
];

// Página de tienda con filtro por categoría y búsqueda
const Shop = () => {
  // Leemos los query params de la URL para sincronizar filtros con el navegador
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaParam = (searchParams.get('categoria') as Categoria) || undefined;
  const busquedaParam = searchParams.get('busqueda') || undefined;

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | undefined>(categoriaParam);
  const [filtroMovilAbierto, setFiltroMovilAbierto] = useState(false);

  // Sincronizamos el estado local cuando cambian los params de la URL
  useEffect(() => {
    setCategoriaSeleccionada(categoriaParam);
  }, [categoriaParam]);

  const { data: productos, isLoading, isError } = useProducts(
    categoriaSeleccionada,
    busquedaParam
  );

  // Cambia la categoría y actualiza la URL para que sea compartible
  const handleCategoriaChange = (categoria: Categoria | '') => {
    const nuevosParams: Record<string, string> = {};
    if (categoria) nuevosParams.categoria = categoria;
    if (busquedaParam) nuevosParams.busqueda = busquedaParam;
    setSearchParams(nuevosParams);
    setFiltroMovilAbierto(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Título de sección */}
      <h1 className="text-2xl font-bold text-marino mb-2 text-center">
        Gifty Mayorista
      </h1>
      {busquedaParam && (
        <p className="text-center text-gray-500 text-sm mb-6">
          Resultados para: <span className="font-semibold">"{busquedaParam}"</span>
        </p>
      )}

      <div className="flex gap-8 mt-6">
        {/* ── Filtro lateral desktop ─────────────────────────────────────── */}
        <aside className="hidden lg:block w-48 shrink-0">
          <h3 className="font-semibold text-marino mb-3 text-sm uppercase tracking-wide">
            Categorías
          </h3>
          <ul className="space-y-1">
            {listaCategorias.map((cat) => (
              <li key={cat.valor}>
                <button
                  onClick={() => handleCategoriaChange(cat.valor)}
                  className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                    (categoriaSeleccionada || '') === cat.valor
                      ? 'bg-rosa-suave text-rosa font-semibold'
                      : 'text-gray-600 hover:text-rosa hover:bg-rosa-suave'
                  }`}
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Contenido principal ────────────────────────────────────────── */}
        <div className="flex-1">
          {/* Barra superior con filtro móvil y contador */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {productos ? `${productos.length} productos` : ''}
            </p>
            {/* Botón para abrir filtros en móvil */}
            <button
              className="lg:hidden flex items-center gap-2 text-sm text-marino border border-marino rounded px-3 py-1.5"
              onClick={() => setFiltroMovilAbierto(true)}
            >
              <SlidersHorizontal size={16} />
              Filtrar
            </button>
          </div>

          {/* Estado de carga con skeleton */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="text-center py-16 text-gray-500">
              <p>Ocurrió un error al cargar los productos.</p>
              <p className="text-sm mt-1">Por favor intentá de nuevo más tarde.</p>
            </div>
          )}

          {/* Grid de productos */}
          {!isLoading && productos && productos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {productos.map((producto) => (
                <ProductCard key={producto._id} producto={producto} />
              ))}
            </div>
          )}

          {/* Sin resultados */}
          {!isLoading && productos && productos.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No se encontraron productos</p>
              <p className="text-sm mt-1">Probá con otra categoría o búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal de filtro para móvil ────────────────────────────────────── */}
      {filtroMovilAbierto && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setFiltroMovilAbierto(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl p-6 lg:hidden">
            <h3 className="font-bold text-marino mb-4">Filtrar por categoría</h3>
            <div className="grid grid-cols-2 gap-2">
              {listaCategorias.map((cat) => (
                <button
                  key={cat.valor}
                  onClick={() => handleCategoriaChange(cat.valor)}
                  className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                    (categoriaSeleccionada || '') === cat.valor
                      ? 'bg-rosa text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-rosa-suave hover:text-rosa'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Shop;
