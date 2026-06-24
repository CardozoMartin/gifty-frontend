import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, ArrowLeft, LogOut, Gift, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { to: '/admin', label: 'Dashboard', icono: LayoutDashboard, end: true },
  { to: '/admin/productos', label: 'Productos', icono: Package, end: false },
  { to: '/admin/pedidos', label: 'Pedidos', icono: ShoppingCart, end: false },
  { to: '/admin/configuracion', label: 'Configuración', icono: Settings, end: false },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: '#e8e9f5' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-60 shrink-0 flex flex-col h-screen" style={{ background: '#ffffff', borderRight: '1px solid #d8d9ee' }}>

        {/* Logo */}
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FF77EC' }}>
              <Gift size={16} color="white" strokeWidth={2} />
            </div>
            <div>
              <p className="font-bold text-base leading-none text-gray-800">Gifty</p>
              <p className="text-[10px] uppercase tracking-widest leading-none mt-0.5 text-gray-500">mayorista</p>
            </div>
          </div>
        </div>

        {/* Separador con label */}
        <div className="px-6 mb-2">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Menú</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icono = item.icono;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-150 rounded-xl ${
                    isActive
                      ? 'bg-[#fce7f3] text-gray-800'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icono size={17} strokeWidth={isActive ? 2 : 1.5} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rosa" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="px-3 pb-6 pt-4 space-y-0.5 border-t border-gray-100 mt-4">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:text-rosa hover:bg-[#fef0f9] rounded-xl transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Ver tienda
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="px-8 py-4 flex items-center justify-between" style={{ background: '#ffffff', borderBottom: '1px solid #d8d9ee' }}>
          <div className="w-64 flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: '#e8e9f5', border: '1px solid #d8d9ee' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="text-xs text-gray-400">Buscar...</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#FF77EC' }}>
              A
            </div>
            <span className="text-sm text-gray-500 font-medium">Admin</span>
          </div>
        </div>

        {/* Página — único elemento con scroll */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
