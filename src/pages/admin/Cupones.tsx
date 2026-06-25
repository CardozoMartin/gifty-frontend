import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, X, Loader2, AlertCircle, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { cuponService, Cupon, CuponInput } from '../../services/cuponService';

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rosa/20 focus:border-rosa transition-colors';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

const formatFecha = (s?: string) =>
  s ? new Date(s).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Modal crear/editar ────────────────────────────────────────────────────────
const ModalCupon = ({
  cupon,
  onClose,
}: {
  cupon: Cupon | null;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CuponInput>({
    defaultValues: cupon ? {
      codigo: cupon.codigo,
      tipo: cupon.tipo,
      valor: cupon.valor,
      fechaVencimiento: cupon.fechaVencimiento ? cupon.fechaVencimiento.slice(0, 10) : '',
      usosMaximos: cupon.usosMaximos,
      unUsorPorUsuario: cupon.unUsorPorUsuario,
    } : {
      tipo: 'porcentaje',
      unUsorPorUsuario: false,
    },
  });

  const tipo = watch('tipo');

  const mutacion = useMutation({
    mutationFn: (datos: CuponInput) =>
      cupon ? cuponService.editar(cupon._id, datos) : cuponService.crear(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cupones'] });
      onClose();
    },
    onError: (e: any) => setError(e.message || 'Error al guardar'),
  });

  const onSubmit = (datos: CuponInput) => {
    setError('');
    mutacion.mutate({
      ...datos,
      fechaVencimiento: datos.fechaVencimiento || undefined,
      usosMaximos: datos.usosMaximos ? Number(datos.usosMaximos) : undefined,
      valor: Number(datos.valor),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-marino text-lg">
            {cupon ? 'Editar cupón' : 'Nuevo cupón'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>Código del cupón <span className="text-rosa">*</span></label>
            <input
              {...register('codigo', { required: 'El código es obligatorio' })}
              placeholder="Ej: GIFTY10"
              className={`${inputCls} uppercase`}
              style={{ textTransform: 'uppercase' }}
              disabled={!!cupon}
            />
            {errors.codigo && <p className="text-red-400 text-xs mt-1">{errors.codigo.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tipo de descuento <span className="text-rosa">*</span></label>
              <select {...register('tipo', { required: true })} className={inputCls}>
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="monto">Monto fijo ($)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Valor {tipo === 'porcentaje' ? '(%)' : '($)'} <span className="text-rosa">*</span>
              </label>
              <input
                type="number"
                {...register('valor', {
                  required: 'Obligatorio',
                  min: { value: 1, message: 'Mínimo 1' },
                  max: tipo === 'porcentaje' ? { value: 100, message: 'Máximo 100%' } : undefined,
                })}
                placeholder={tipo === 'porcentaje' ? '10' : '500'}
                className={inputCls}
              />
              {errors.valor && <p className="text-red-400 text-xs mt-1">{errors.valor.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha de vencimiento</label>
              <input
                type="date"
                {...register('fechaVencimiento')}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Usos máximos</label>
              <input
                type="number"
                {...register('usosMaximos', { min: { value: 1, message: 'Mínimo 1' } })}
                placeholder="Sin límite"
                className={inputCls}
              />
              {errors.usosMaximos && <p className="text-red-400 text-xs mt-1">{errors.usosMaximos.message}</p>}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('unUsorPorUsuario')} className="w-4 h-4 accent-rosa rounded" />
            <span className="text-sm text-gray-600">Un uso por usuario (requiere estar logueado)</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutacion.isPending}
              className="flex items-center gap-2 px-5 py-2 bg-rosa text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {mutacion.isPending && <Loader2 size={14} className="animate-spin" />}
              {cupon ? 'Guardar cambios' : 'Crear cupón'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
const Cupones = () => {
  const queryClient = useQueryClient();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cuponEditando, setCuponEditando] = useState<Cupon | null>(null);
  const [confirmEliminar, setConfirmEliminar] = useState<string | null>(null);

  const { data: cupones = [], isLoading } = useQuery({
    queryKey: ['cupones'],
    queryFn: cuponService.listar,
  });

  const toggleActivo = useMutation({
    mutationFn: (cupon: Cupon) => cuponService.editar(cupon._id, { activo: !cupon.activo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cupones'] }),
  });

  const eliminar = useMutation({
    mutationFn: cuponService.eliminar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cupones'] });
      setConfirmEliminar(null);
    },
  });

  const abrirCrear = () => {
    setCuponEditando(null);
    setModalAbierto(true);
  };

  const abrirEditar = (cupon: Cupon) => {
    setCuponEditando(cupon);
    setModalAbierto(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-marino">Cupones de descuento</h1>
          <p className="text-sm text-gray-400 mt-0.5">{cupones.length} cupón{cupones.length !== 1 ? 'es' : ''} creado{cupones.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-rosa text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Nuevo cupón
        </button>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-rosa" />
        </div>
      ) : cupones.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-300">
          <Tag size={48} strokeWidth={1} />
          <p className="text-sm mt-3 text-gray-400">Todavía no creaste ningún cupón</p>
          <button onClick={abrirCrear} className="mt-4 text-sm text-rosa hover:underline">Crear el primero</button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descuento</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usos</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vencimiento</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cupones.map((cupon) => (
                <tr key={cupon._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-marino bg-gray-100 px-2 py-0.5 rounded">
                      {cupon.codigo}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-marino">
                    {cupon.tipo === 'porcentaje' ? `${cupon.valor}%` : fmt(cupon.valor)}
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {cupon.usosActuales}
                    {cupon.usosMaximos ? ` / ${cupon.usosMaximos}` : ' / ∞'}
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {cupon.fechaVencimiento ? (
                      <span className={new Date(cupon.fechaVencimiento) < new Date() ? 'text-red-400' : ''}>
                        {formatFecha(cupon.fechaVencimiento)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleActivo.mutate(cupon)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                        cupon.activo
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {cupon.activo
                        ? <><ToggleRight size={14} /> Activo</>
                        : <><ToggleLeft size={14} /> Inactivo</>
                      }
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => abrirEditar(cupon)}
                        className="p-1.5 text-gray-400 hover:text-marino hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmEliminar(cupon._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear/editar */}
      {modalAbierto && (
        <ModalCupon
          cupon={cuponEditando}
          onClose={() => setModalAbierto(false)}
        />
      )}

      {/* Confirm eliminar */}
      {confirmEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-marino mb-2">¿Eliminar cupón?</h3>
            <p className="text-sm text-gray-500 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmEliminar(null)}
                className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminar.mutate(confirmEliminar)}
                disabled={eliminar.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-60"
              >
                {eliminar.isPending && <Loader2 size={13} className="animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cupones;
