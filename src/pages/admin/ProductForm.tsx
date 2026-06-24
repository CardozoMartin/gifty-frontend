import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { ArrowLeft, ImageUp, X, Save, Package } from 'lucide-react';
import {
  useProductById,
  useCreateProduct,
  useUpdateProduct,
  useUploadProductImage,
} from '../../hooks/useProducts';
import { useConfig } from '../../hooks/useConfig';
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

const inputCls =
  'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-rosa focus:ring-2 focus:ring-rosa/10 transition-colors bg-white placeholder:text-gray-400';

const labelCls = 'block text-sm font-medium text-gray-600 mb-1.5';

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const esEdicion = !!id;
  const navigate = useNavigate();

  const { data: productoExistente, isLoading: cargandoProducto } = useProductById(id || '');
  const { data: config } = useConfig();
  const descuentoEfectivo = config?.descuentoEfectivo ?? 0;

  const crearProducto = useCreateProduct();
  const actualizarProducto = useUpdateProduct();
  const subirImagen = useUploadProductImage();

  const [imagenSeleccionada, setImagenSeleccionada] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputImagenRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
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

  // Observa el precio de lista para recalcular precioEfectivo automáticamente
  const precioLista = useWatch({ control, name: 'precio' });

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

  // Recalcula precioEfectivo cuando cambia el precio o el % global de descuento
  useEffect(() => {
    if (!descuentoEfectivo || !precioLista) return;
    setValue('precioEfectivo', Math.round(precioLista * (1 - descuentoEfectivo / 100)), { shouldDirty: false });
  }, [precioLista, descuentoEfectivo, setValue]);

  const aplicarArchivo = (archivo: File) => {
    setImagenSeleccionada(archivo);
    setPreviewUrl(URL.createObjectURL(archivo));
  };

  const handleSeleccionarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) aplicarArchivo(archivo);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const archivo = e.dataTransfer.files?.[0];
    if (archivo && archivo.type.startsWith('image/')) aplicarArchivo(archivo);
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
  const imagenMostrada = previewUrl || imagenActual || null;

  return (
    <div className="max-w-5xl">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/productos')}
            className="p-2 rounded-lg text-gray-500 hover:text-rosa hover:bg-rosa-suave transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-marino">
              {esEdicion ? 'Editar producto' : 'Nuevo Producto'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {esEdicion
                ? 'Modificá los datos del producto.'
                : 'Agregá un nuevo artículo al catálogo.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/productos')}
            className="px-5 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-700 transition-colors bg-white"
          >
            Cancelar
          </button>
          <button
            form="producto-form"
            type="submit"
            disabled={estaCargando}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-60"
            style={{ background: '#e91e8c' }}
          >
            <Save size={15} />
            {estaCargando ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </div>

      <form id="producto-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-5 gap-5">

          {/* ── Columna izquierda (2/5) ──────────────────────────────────── */}
          <div className="col-span-2 space-y-4">

            {/* Card imágenes */}
            <div className="rounded-xl p-5" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">Imágenes</p>
                <ImageUp size={16} className="text-gray-400" />
              </div>

              {/* Zona drag & drop */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputImagenRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors mb-3 ${
                  dragging ? 'border-rosa bg-rosa-suave' : 'border-gray-200 hover:border-rosa hover:bg-[#fdf5fb]'
                }`}
                style={{ minHeight: '200px' }}
              >
                {imagenMostrada ? (
                  <>
                    <img
                      src={imagenMostrada}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium">Cambiar imagen</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                      <ImageUp size={22} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Arrastrá o seleccioná fotos</p>
                    <p className="text-xs text-gray-400">Formatos soportados: PNG, JPG (Máx 5MB)</p>
                  </>
                )}
                <input
                  ref={inputImagenRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleSeleccionarImagen}
                />
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => inputImagenRef.current?.click()}
                  className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-rosa hover:text-rosa transition-colors text-xl"
                >
                  +
                </button>
                {imagenMostrada && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-rosa">
                    <img src={imagenMostrada} alt="thumb" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={resetImagen}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <X size={9} color="white" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card estado */}
            <div className="rounded-xl p-5" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <p className="text-sm font-semibold text-gray-700 mb-4">Estado del Producto</p>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package size={16} className="text-rosa" strokeWidth={1.5} />
                  Visible en tienda
                </div>
                <div className="relative">
                  <input type="checkbox" {...register('activo')} className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-rosa transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                </div>
              </label>
            </div>
          </div>

          {/* ── Columna derecha (3/5) ─────────────────────────────────────── */}
          <div className="col-span-3 space-y-4">

            {/* Información General */}
            <div className="rounded-xl p-6" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <p className="text-sm font-semibold text-gray-700 mb-5">Información General</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>
                    Nombre del Producto <span className="text-rosa">*</span>
                  </label>
                  <input
                    {...register('nombre', { required: 'El nombre es obligatorio' })}
                    placeholder="Ej: Taza Stitch Grande"
                    className={inputCls}
                  />
                  {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre.message}</p>}
                </div>

                <div>
                  <label className={labelCls}>
                    Descripción <span className="text-rosa">*</span>
                  </label>
                  <textarea
                    {...register('descripcion', { required: 'La descripción es obligatoria' })}
                    rows={4}
                    placeholder="Detallá las características, materiales y dimensiones del producto..."
                    className={`${inputCls} resize-none`}
                  />
                  {errors.descripcion && <p className="text-red-400 text-xs mt-1">{errors.descripcion.message}</p>}
                </div>

                <div>
                  <label className={labelCls}>Categoría</label>
                  <select {...register('categoria')} className={inputCls}>
                    {categorias.map((cat) => (
                      <option key={cat.valor} value={cat.valor}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Precios */}
            <div className="rounded-xl p-6" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-rosa-suave flex items-center justify-center">
                  <span className="text-rosa text-xs font-bold">$</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">Precios</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Precio de lista <span className="text-rosa">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      {...register('precio', { required: 'Requerido', min: 0, valueAsNumber: true })}
                      className={`${inputCls} pl-8`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.precio && <p className="text-red-400 text-xs mt-1">{errors.precio.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>
                    Precio efectivo <span className="text-rosa">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">$</span>
                    <input
                      type="number"
                      step="0.01"
                      {...register('precioEfectivo', { required: 'Requerido', min: 0, valueAsNumber: true })}
                      className={`${inputCls} pl-8`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.precioEfectivo && <p className="text-red-400 text-xs mt-1">{errors.precioEfectivo.message}</p>}
                  {descuentoEfectivo > 0 ? (
                    <p className="text-xs text-rosa mt-1">
                      Calculado automáticamente ({descuentoEfectivo}% OFF). Podés editarlo.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Precio pagando en efectivo</p>
                  )}
                </div>
              </div>
            </div>

            {/* Inventario */}
            <div className="rounded-xl p-6" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Package size={14} className="text-blue-400" strokeWidth={1.8} />
                </div>
                <p className="text-sm font-semibold text-gray-700">Inventario</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Stock Inicial</label>
                  <input
                    type="number"
                    {...register('stock', { valueAsNumber: true, min: 0 })}
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Cantidad mínima mayorista</label>
                  <input
                    type="number"
                    {...register('cantidadMinima', { valueAsNumber: true, min: 1 })}
                    placeholder="6"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
