import { Link } from 'react-router-dom';
import { Package, ShoppingCart, AlertCircle, BarChart2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useProductsAdmin } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';

const Dashboard = () => {
  const { data: productos, isLoading: cargandoProductos } = useProductsAdmin();
  const { data: pedidos, isLoading: cargandoPedidos } = useOrders();

  const totalProductos = productos?.length || 0;
  const productosActivos = productos?.filter((p) => p.activo).length || 0;
  const sinStock = productos?.filter((p) => p.stock === 0 && p.activo).length || 0;
  const pedidosPendientes = pedidos?.filter((p) => p.estado === 'pendiente').length || 0;
  const pedidosEntregados = pedidos?.filter((p) => p.estado === 'entregado').length || 0;

  const cargando = cargandoProductos || cargandoPedidos;

  const tarjetas = [
    {
      titulo: 'Productos activos',
      valor: productosActivos,
      subtitulo: `de ${totalProductos} en total`,
      icono: Package,
      acento: 'bg-[#fce7f3] text-rosa',
      borde: 'border-l-rosa',
      link: '/admin/productos',
    },
    {
      titulo: 'Pedidos totales',
      valor: pedidos?.length || 0,
      subtitulo: `${pedidosPendientes} pendientes`,
      icono: ShoppingCart,
      acento: 'bg-marino/10 text-marino',
      borde: 'border-l-marino',
      link: '/admin/pedidos',
    },
    {
      titulo: 'Entregados',
      valor: pedidosEntregados,
      subtitulo: 'pedidos completados',
      icono: BarChart2,
      acento: 'bg-emerald-50 text-emerald-600',
      borde: 'border-l-emerald-400',
      link: '/admin/pedidos',
    },
    {
      titulo: 'Sin stock',
      valor: sinStock,
      subtitulo: 'requieren reposición',
      icono: AlertCircle,
      acento: 'bg-orange-50 text-orange-500',
      borde: 'border-l-orange-400',
      link: '/admin/productos',
    },
  ];

  const colorEstado = (estado: string) => {
    if (estado === 'pendiente') return 'bg-yellow-100 text-yellow-700';
    if (estado === 'entregado') return 'bg-emerald-100 text-emerald-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="space-y-8">

      {/* Encabezado */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">Panel de control</p>
          <h1 className="text-2xl font-bold text-marino">Bienvenida, Gifty 🎁</h1>
        </div>
        <Link
          to="/admin/productos"
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-rosa px-4 py-2 hover:bg-rosa-claro transition-colors"
        >
          <Package size={14} />
          Nuevo producto
        </Link>
      </div>

      {/* Tarjetas métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tarjetas.map((t) => {
          const Icono = t.icono;
          return (
            <Link
              key={t.titulo}
              to={t.link}
              className={`border-l-4 ${t.borde} p-5 transition-shadow group hover:shadow-md`}
              style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeftWidth: '4px' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${t.acento}`}>
                  <Icono size={18} strokeWidth={1.8} />
                </div>
                <ArrowRight size={14} className="text-gray-400 group-hover:text-rosa transition-colors mt-1" />
              </div>
              {cargando ? (
                <div className="h-7 w-12 bg-gray-100 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-3xl font-bold text-marino leading-none mb-1">{t.valor}</p>
              )}
              <p className="text-xs text-gray-500">{t.titulo}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.subtitulo}</p>
            </Link>
          );
        })}
      </div>

      {/* Fila inferior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Últimos pedidos */}
        <div style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-rosa" strokeWidth={1.8} />
              <h2 className="text-sm font-semibold text-marino">Últimos pedidos</h2>
            </div>
            <Link to="/admin/pedidos" className="text-xs text-rosa hover:underline flex items-center gap-0.5">
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>

          <div className="px-6 py-4">
            {cargandoPedidos ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-9 rounded animate-pulse" style={{ background: '#ffffff08' }} />
                ))}
              </div>
            ) : pedidos && pedidos.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {pedidos.slice(0, 5).map((pedido) => (
                  <li key={pedido._id} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-marino">{pedido.numeroPedido}</span>
                      <span className="text-xs text-gray-500 ml-2 truncate">{pedido.cliente.nombre}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 font-medium shrink-0 ml-3 ${colorEstado(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <ShoppingCart size={32} strokeWidth={1} />
                <p className="text-sm mt-2">Sin pedidos aún</p>
              </div>
            )}
          </div>
        </div>

        {/* Alertas de stock */}
        <div style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-orange-400" strokeWidth={1.8} />
              <h2 className="text-sm font-semibold text-marino">Alertas de stock</h2>
            </div>
            <Link to="/admin/productos" className="text-xs text-rosa hover:underline flex items-center gap-0.5">
              Gestionar <ArrowRight size={11} />
            </Link>
          </div>

          <div className="px-6 py-4">
            {cargandoProductos ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-9 rounded animate-pulse" style={{ background: '#ffffff08' }} />
                ))}
              </div>
            ) : sinStock > 0 ? (
              <ul className="divide-y divide-gray-100">
                {productos!
                  .filter((p) => p.stock === 0 && p.activo)
                  .slice(0, 5)
                  .map((producto) => (
                    <li key={producto._id} className="flex items-center gap-3 py-2.5">
                      {producto.imagenes[0] ? (
                        <img src={producto.imagenes[0]} alt={producto.nombre} className="w-8 h-8 object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 shrink-0" />
                      )}
                      <span className="text-xs text-marino truncate flex-1">{producto.nombre}</span>
                      <span className="text-xs font-semibold text-orange-500 shrink-0">Sin stock</span>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center py-8 text-emerald-400">
                <CheckCircle2 size={32} strokeWidth={1} />
                <p className="text-sm mt-2 text-gray-500">Todos los productos tienen stock</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
