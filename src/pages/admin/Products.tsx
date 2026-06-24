import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ImagePlus } from 'lucide-react';
import {
  useProductsAdmin,
  useDeleteProduct,
} from '../../hooks/useProducts';
import { Producto } from '../../types/producto';

const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precio);

const AdminProducts = () => {
  const navigate = useNavigate();
  const { data: productos, isLoading } = useProductsAdmin();
  const eliminarProducto = useDeleteProduct();
  const [productoAEliminar, setProductoAEliminar] = useState<string | null>(null);

  const handleEliminar = async () => {
    if (!productoAEliminar) return;
    await eliminarProducto.mutateAsync(productoAEliminar);
    setProductoAEliminar(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">Gestión</p>
          <h1 className="text-xl font-bold text-gray-800">Productos</h1>
        </div>
        <button
          onClick={() => navigate('/admin/productos/nuevo')}
          className="flex items-center gap-2 text-xs font-semibold text-white px-4 py-2.5 rounded-xl transition-colors"
          style={{ background: '#FF77EC' }}
        >
          <Plus size={15} />
          Nuevo producto
        </button>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Producto</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Categoría</th>
                  <th className="text-right px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Precio</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Stock</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Estado</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {productos?.map((producto: Producto) => (
                  <tr key={producto._id} className="hover:bg-[#fef9fe] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {producto.imagenes[0] ? (
                          <img
                            src={producto.imagenes[0]}
                            alt={producto.nombre}
                            className="w-11 h-11 object-cover rounded-xl border border-gray-100"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
                            <ImagePlus size={16} className="text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-800 truncate max-w-48">
                          {producto.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 capitalize text-gray-600 text-xs">{producto.categoria}</td>
                    <td className="px-4 py-4 text-right font-semibold text-rosa">
                      {formatearPrecio(producto.precio)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`font-semibold text-sm ${producto.stock === 0 ? 'text-red-400' : 'text-emerald-500'}`}>
                        {producto.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        producto.activo ? 'bg-[#fce7f3] text-rosa' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/admin/productos/${producto._id}/editar`)}
                          className="p-2 text-gray-400 hover:text-rosa hover:bg-[#fce7f3] rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setProductoAEliminar(producto._id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!productos || productos.length === 0) && (
              <div className="text-center py-16 text-gray-400">
                <ImagePlus size={40} strokeWidth={1} className="mx-auto mb-3" />
                <p className="text-sm">No hay productos aún</p>
                <button
                  onClick={() => navigate('/admin/productos/nuevo')}
                  className="text-rosa text-sm hover:underline mt-2 block mx-auto"
                >
                  Crear el primer producto
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {productoAEliminar && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-xl">
              <h3 className="text-base font-bold text-gray-800 mb-1">¿Eliminar producto?</h3>
              <p className="text-sm text-gray-400 mb-6">Esta acción es permanente y no se puede deshacer.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setProductoAEliminar(null)}
                  className="flex-1 border border-gray-200 text-gray-500 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminar}
                  disabled={eliminarProducto.isPending}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {eliminarProducto.isPending ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminProducts;
