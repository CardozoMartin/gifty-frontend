import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Layouts
import TopBanner from './components/layout/TopBanner';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// Auth
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';
import UserProtectedRoute from './components/auth/UserProtectedRoute';

// Componentes del carrito
import CartSidebar from './components/shop/CartSidebar';

// Páginas de la tienda
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import HowToBuy from './pages/HowToBuy';
import Checkout from './pages/Checkout';
import CustomerAccount from './pages/CustomerAccount';
import MiCuenta from './pages/MiCuenta';

// Páginas de auth del cliente
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Páginas del panel admin
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import AdminOrders from './pages/admin/Orders';
import AdminConfig from './pages/admin/Config';

// Configuración de TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

// Layout general de la tienda (navbar + contenido + footer + carrito)
const ShopLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <TopBanner />
    {children}
    <Footer />
    <CartSidebar />
  </>
);

// Componente raíz: configura el router y los providers globales
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ── Rutas de la tienda pública ──────────────────────────────── */}
          <Route
            path="/"
            element={<ShopLayout><Home /></ShopLayout>}
          />
          <Route
            path="/tienda"
            element={<ShopLayout><Shop /></ShopLayout>}
          />
          <Route
            path="/tienda/:slug"
            element={<ShopLayout><ProductDetail /></ShopLayout>}
          />
          <Route
            path="/como-comprar"
            element={<ShopLayout><HowToBuy /></ShopLayout>}
          />
          <Route
            path="/checkout"
            element={<ShopLayout><Checkout /></ShopLayout>}
          />

          {/* ── Auth del cliente — solo accesibles si NO está logueado ─── */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/recuperar-password" element={<ForgotPassword />} />
            <Route path="/cuenta-mayorista" element={<ShopLayout><CustomerAccount /></ShopLayout>} />
          </Route>

          {/* Verificar email — siempre accesible (el link llega por email) */}
          <Route path="/verificar-email/:token" element={<VerifyEmail />} />

          {/* ── Rutas del cliente logueado ───────────────────────────────── */}
          <Route element={<UserProtectedRoute />}>
            <Route path="/mi-cuenta" element={<ShopLayout><MiCuenta /></ShopLayout>} />
          </Route>

          {/* ── Login del admin — público ───────────────────────────────── */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ── Panel admin — protegido: redirige a /admin/login si no hay sesión */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="productos" element={<AdminProducts />} />
              <Route path="productos/nuevo" element={<ProductForm />} />
              <Route path="productos/:id/editar" element={<ProductForm />} />
              <Route path="pedidos" element={<AdminOrders />} />
              <Route path="configuracion" element={<AdminConfig />} />
            </Route>
          </Route>

          {/* Cualquier ruta desconocida redirige al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
