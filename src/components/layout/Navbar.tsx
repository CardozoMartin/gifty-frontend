import { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import logoGifty from '../../img/logo-gifty.png';

// Categorías del dropdown "Tienda"
const categorias = [
  { nombre: 'Tazas', slug: 'tazas' },
  { nombre: 'Mates', slug: 'mates' },
  { nombre: 'Botellas', slug: 'botellas' },
  { nombre: 'Librería', slug: 'libreria' },
  { nombre: 'Box', slug: 'box' },
  { nombre: 'Cotillón', slug: 'cotillon' },
];

const Navbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [busquedaVisible, setBusquedaVisible] = useState(false);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const inputBusquedaRef = useRef<HTMLInputElement>(null);

  const { cantidadTotal, abrirCarrito } = useCart();

  // Foco automático al abrir el campo de búsqueda
  useEffect(() => {
    if (busquedaVisible) {
      inputBusquedaRef.current?.focus();
    }
  }, [busquedaVisible]);

  // Estilo del NavLink según si está activo
  const estiloNavLink = ({ isActive }: { isActive: boolean }) =>
    `text-sm tracking-wide transition-colors duration-200 font-medium ${
      isActive ? 'text-rosa' : 'text-marino hover:text-rosa'
    }`;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* ── Logo — izquierda ──────────────────────────────────────── */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src={logoGifty}
              alt="Gifty"
              className="h-14 w-auto object-contain"
            />
          </Link>

          {/* ── Lado derecho: links + íconos ──────────────────────────── */}
          <div className="flex items-center gap-9">
          {/* ── Links de navegación — desktop ─────────────────────────── */}
          <div className="hidden md:flex items-center space-x-9">
            <NavLink to="/" className={estiloNavLink} end>
              Inicio
            </NavLink>

            {/* Dropdown Tienda */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownAbierto(true)}
              onMouseLeave={() => setDropdownAbierto(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-marino hover:text-rosa transition-colors tracking-wide">
                Tienda
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${dropdownAbierto ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Panel desplegable de categorías */}
              {dropdownAbierto && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 bg-white shadow-lg border border-gray-100 rounded-b-md py-2 min-w-44 z-50">
                  <Link
                    to="/tienda"
                    className="block px-5 py-2 text-sm text-marino hover:text-rosa hover:bg-gray-50 transition-colors"
                  >
                    Todos los productos
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  {categorias.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/tienda?categoria=${cat.slug}`}
                      className="block px-5 py-2 text-sm text-marino hover:text-rosa hover:bg-gray-50 transition-colors"
                    >
                      {cat.nombre}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/como-comprar" className={estiloNavLink}>
              Cómo comprar
            </NavLink>

            <NavLink to="/cuenta-mayorista" className={estiloNavLink}>
              Cuenta Mayorista
            </NavLink>
          </div>

          {/* ── Íconos derecha ────────────────────────────────────────── */}
          <div className="flex items-center space-x-4">

            {/* Buscador */}
            {busquedaVisible ? (
              <form
                className="flex items-center gap-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (textoBusqueda.trim()) {
                    window.location.href = `/tienda?busqueda=${encodeURIComponent(textoBusqueda.trim())}`;
                  }
                }}
              >
                <input
                  ref={inputBusquedaRef}
                  type="text"
                  placeholder="Buscar..."
                  value={textoBusqueda}
                  onChange={(e) => setTextoBusqueda(e.target.value)}
                  className="border-b border-marino outline-none text-sm px-1 py-0.5 w-36 bg-transparent text-marino placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    setBusquedaVisible(false);
                    setTextoBusqueda('');
                  }}
                  className="text-gray-400 hover:text-rosa transition-colors ml-1"
                >
                  <X size={15} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setBusquedaVisible(true)}
                className="text-marino hover:text-rosa transition-colors p-1"
                aria-label="Buscar"
              >
                {/* Ícono lupa outline igual al del navbar original */}
                <Search size={20} strokeWidth={1.5} />
              </button>
            )}

            {/* Carrito con contador */}
            <button
              onClick={abrirCarrito}
              className="relative text-marino hover:text-rosa transition-colors p-1"
              aria-label="Carrito de compras"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cantidadTotal > 0 && (
                <span className="absolute -top-1 -right-1 bg-rosa text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {cantidadTotal}
                </span>
              )}
            </button>

            {/* Hamburguesa móvil */}
            <button
              className="md:hidden text-marino hover:text-rosa p-1"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label="Menú"
            >
              {menuAbierto ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
          </div>{/* fin lado derecho */}
        </div>
      </div>

      {/* ── Menú móvil ──────────────────────────────────────────────────── */}
      {menuAbierto && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-5 space-y-4">
          <NavLink
            to="/"
            className={estiloNavLink}
            onClick={() => setMenuAbierto(false)}
            end
          >
            Inicio
          </NavLink>
          <div>
            <p className="text-sm font-medium text-marino mb-2">Tienda</p>
            <div className="pl-3 space-y-2">
              <Link
                to="/tienda"
                className="block text-sm text-gray-500 hover:text-rosa"
                onClick={() => setMenuAbierto(false)}
              >
                Todos los productos
              </Link>
              {categorias.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/tienda?categoria=${cat.slug}`}
                  className="block text-sm text-gray-500 hover:text-rosa"
                  onClick={() => setMenuAbierto(false)}
                >
                  {cat.nombre}
                </Link>
              ))}
            </div>
          </div>
          <NavLink
            to="/como-comprar"
            className={estiloNavLink}
            onClick={() => setMenuAbierto(false)}
          >
            Cómo comprar
          </NavLink>
          <NavLink
            to="/cuenta-mayorista"
            className={estiloNavLink}
            onClick={() => setMenuAbierto(false)}
          >
            Cuenta Mayorista
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
