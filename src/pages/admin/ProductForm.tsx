import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, ImagePlus } from 'lucide-react';
import {
  useProductById,
  useCreateProduct,
  useUpdateProduct,
  useUploadProductImage,
} from '../../hooks/useProducts';
import { Categoria, ProductoFormData } from '../../types/producto';

const categorias: { label: string; valor: Categoria }[] = [
  { label: 'Tazas', valor: 'tazas' },
  { label: 'Mates', valor: 'mates' },
  { label: 'Botellas', valor: 'botellas' },
  { label: 'Librería', valor: 'libreria' },
  { label: 'Box', valor: 'box' },
  { label: 'Cotillón', valor: 'cotillon' },
  { label: 'Otros', valor: 'otros' },
];

// Página de creación y edición de producto
const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const esEdicion = !!id;
  const navigate = useNavigate();

  const { data: productoExistente, isLoading: cargandoProducto } = useProductById(id || '');

  const crearProducto = useCreateProduct();
  const actualizarProducto = useUpdateProduct();
  const subirImagen = useUploadProductImage();

  const [imagenSeleccionada, setImagenSeleccionada] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputImagenRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductoFormData>({
    defaultValues: {
      activo: true,
      stock: 0,
      cantidadMinima: 6,
      precio: 0,
      precioEfectivo: 0,
      categoria: 'tazas',
    },
  });

  // Carga los datos del producto cuando se edita
  useEffect(() => {
    if (productoExistente) {
      reset({
        nombre: productoExistente.nombre,
        descripcion: productoExistente.descripcion,
        precio: productoExistente.precio,
        precioEfectivo: productoExistente.precioEfectivo,
        categoria: productoExistente.categoria,
        stock: productoExistente.stock,
        cantidadMinima: productoExistente.cantidadMinima,
        activo: productoExistente.activo,
      });
    }
  }, [productoExistente, reset]);

  const handleSeleccionarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setImagenSeleccionada(archivo);
    setPreviewUrl(URL.createObjectURL(archivo));
  };

  const resetImagen = () => {
    setImagenSeleccionada(null);
    setPreviewUrl(null);
    if (inputImagenRef.current) inputImagenRef.current.value = '';
  };

  const onSubmit = async (datos: ProductoFormData) => {
    if (esEdicion && id) {
      await actualizarProducto.mutateAsync({ id, datos });
      if (imagenSeleccionada) {
        await subirImagen.mutateAsync({ id, archivo: imagenSeleccionada });
      }
    } else {
      const productoCreado = await crearProducto.mutateAsync(datos);
      if (imagenSeleccionada) {
        await subirImagen.mutateAsync({ id: productoCreado._id, archivo: imagenSeleccionada });
      }
    }
    navigate('/admin/productos');
  };

  const estaCargando =
    crearProducto.isPending || actualizarProducto.isPending || subirImagen.isPending;

  if (esEdicion && cargandoProducto) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-rosa border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const imagenActual = productoExistente?.imagenes[0];

  return (
    <div className="max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/productos')}
          className="p-2 rounded-lg hover:bg-[#fef0f9] text-gray-400 hover:text-rosa transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">Productos</p>
          <h1 className="text-xl font-bold text-gray-800">
            {esEdicion ? 'Editar producto' : 'Nuevo producto'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-3 gap-6">

          {/* ── Columna izquierda: imagen ──────────────────────────────── */}
          <div className="col-span-1 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                Imagen
              </p>

              {/* Preview o imagen actual */}
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : imagenActual ? (
                  <img src={imagenActual} alt="Imagen actual" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300">
                    <ImagePlus size={36} strokeWidth={1} />
                    <span className="text-xs">Sin imagen</span>
                  </div>
                )}
              </div>

              {/* Botón seleccionar imagen */}
              <label className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-gray-400 hover:border-rosa hover:text-rosa cursor-pointer transition-colors">
                <Upload size={15} />
                {previewUrl ? 'Cambiar imagen' : 'Subir imagen'}
                <input
                  ref={inputImagenRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleSeleccionarImagen}
                />
              </label>

              {/* Nombre del archivo seleccionado */}
              {imagenSeleccionada && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-rosa truncate flex-1">{imagenSeleccionada.name}</p>
                  <button type="button" onClick={resetImagen} className="text-gray-300 hover:text-red-400">
                    <X size={13} />
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-300 mt-3 text-center">JPG, PNG o WEBP — máx. 5MB</p>
            </div>

            {/* Switch activo */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                Visibilidad
              </p>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-700">Producto activo</p>
                  <p className="text-xs text-gray-400 mt-0.5">Visible en la tienda</p>
                </div>
                <div className="relative">
                  <input type="checkbox" {...register('activo')} className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-rosa transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                </div>
              </label>
            </div>
          </div>

          {/* ── Columna derecha: datos ─────────────────────────────────── */}
          <div className="col-span-2 space-y-4">

            {/* Información básica */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">
                Información básica
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre del producto <span className="text-rosa">*</span>
                  </label>
                  <input
                    {...register('nombre', { required: 'El nombre es obligatorio' })}
                    placeholder="Ej: Taza Stitch Grande"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rosa transition-colors"
                  />
                  {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Descripción <span className="text-rosa">*</span>
                  </label>
                  <textarea
                    {...register('descripcion', { required: 'La descripción es obligatoria' })}
                    rows={4}
                    placeholder="Descripción del producto..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rosa transition-colors resize-none"
                  />
                  {errors.descripcion && <p className="text-red-400 text-xs mt-1">{errors.descripcion.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
                  <select
                    {...register('categoria')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rosa transition-colors bg-white"
                  >
                    {categorias.map((cat) => (
                      <option key={cat.valor} value={cat.valor}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Precios */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">
                Precios
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Precio de lista <span className="text-rosa">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      {...register('precio', { required: 'Requerido', min: 0, valueAsNumber: true })}
                      className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-2.5 text-sm outline-none focus:border-rosa transition-colors"
                    />
                  </div>
                  {errors.precio && <p className="text-red-400 text-xs mt-1">{errors.precio.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Precio efectivo <span className="text-rosa">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      {...register('precioEfectivo', { required: 'Requerido', min: 0, valueAsNumber: true })}
                      className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-2.5 text-sm outline-none focus:border-rosa transition-colors"
                    />
                  </div>
                  {errors.precioEfectivo && <p className="text-red-400 text-xs mt-1">{errors.precioEfectivo.message}</p>}
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">
                Stock y mayorista
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock disponible</label>
                  <input
                    type="number"
                    {...register('stock', { valueAsNumber: true, min: 0 })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rosa transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad mínima</label>
                  <input
                    type="number"
                    {...register('cantidadMinima', { valueAsNumber: true, min: 1 })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rosa transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/productos')}
                className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={estaCargando}
                className="px-8 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-60"
                style={{ background: '#FF77EC' }}
              >
                {estaCargando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
