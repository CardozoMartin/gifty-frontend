import { useEffect, useState } from 'react';
import { Plus, X, Save, CreditCard, Truck, AlertCircle } from 'lucide-react';
import { useConfig, useUpdateConfig } from '../../hooks/useConfig';

// Editor de lista (métodos de pago o medios de envío)
const ListaEditor = ({
  titulo,
  icono: Icono,
  items,
  onChange,
}: {
  titulo: string;
  icono: React.ElementType;
  items: string[];
  onChange: (items: string[]) => void;
}) => {
  const [nuevoItem, setNuevoItem] = useState('');

  const agregarItem = () => {
    const texto = nuevoItem.trim();
    if (!texto) return;
    onChange([...items, texto]);
    setNuevoItem('');
  };

  const eliminarItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const editarItem = (idx: number, valor: string) => {
    const copia = [...items];
    copia[idx] = valor;
    onChange(copia);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#fce7f3] flex items-center justify-center">
          <Icono size={16} className="text-rosa" strokeWidth={1.8} />
        </div>
        <h2 className="text-sm font-semibold text-gray-800">{titulo}</h2>
      </div>

      {/* Lista de items editables */}
      <div className="space-y-2 mb-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-rosa text-xs mt-0.5">–</span>
            <input
              value={item}
              onChange={(e) => editarItem(idx, e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rosa transition-colors"
            />
            <button
              onClick={() => eliminarItem(idx)}
              className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-gray-300 text-center py-4">Sin ítems todavía</p>
        )}
      </div>

      {/* Input para agregar nuevo item */}
      <div className="flex gap-2">
        <input
          value={nuevoItem}
          onChange={(e) => setNuevoItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && agregarItem()}
          placeholder="Agregar nuevo..."
          className="flex-1 border border-dashed border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rosa transition-colors"
        />
        <button
          onClick={agregarItem}
          className="p-2 bg-[#fce7f3] text-rosa rounded-xl hover:bg-rosa hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

// Página de configuración del admin
const AdminConfig = () => {
  const { data: config, isLoading } = useConfig();
  const updateConfig = useUpdateConfig();

  const [metodosPago, setMetodosPago] = useState<string[]>([]);
  const [mediosEnvio, setMediosEnvio] = useState<string[]>([]);
  const [notaEnvio, setNotaEnvio] = useState('');
  const [guardado, setGuardado] = useState(false);

  // Carga los datos cuando llegan del servidor
  useEffect(() => {
    if (config) {
      setMetodosPago(config.metodosPago);
      setMediosEnvio(config.mediosEnvio);
      setNotaEnvio(config.notaEnvio);
    }
  }, [config]);

  const handleGuardar = async () => {
    await updateConfig.mutateAsync({ metodosPago, mediosEnvio, notaEnvio });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-rosa border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">Tienda</p>
          <h1 className="text-xl font-bold text-gray-800">Configuración</h1>
        </div>
        <button
          onClick={handleGuardar}
          disabled={updateConfig.isPending}
          className="flex items-center gap-2 text-xs font-semibold text-white px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
          style={{ background: '#FF77EC' }}
        >
          <Save size={14} />
          {updateConfig.isPending ? 'Guardando...' : guardado ? '¡Guardado!' : 'Guardar cambios'}
        </button>
      </div>

      <div className="space-y-5">
        {/* Métodos de pago */}
        <ListaEditor
          titulo="Métodos de pago"
          icono={CreditCard}
          items={metodosPago}
          onChange={setMetodosPago}
        />

        {/* Medios de envío */}
        <ListaEditor
          titulo="Medios de envío"
          icono={Truck}
          items={mediosEnvio}
          onChange={setMediosEnvio}
        />

        {/* Nota de envío */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#fce7f3] flex items-center justify-center">
              <AlertCircle size={16} className="text-rosa" strokeWidth={1.8} />
            </div>
            <h2 className="text-sm font-semibold text-gray-800">Nota sobre el envío</h2>
          </div>
          <textarea
            value={notaEnvio}
            onChange={(e) => setNotaEnvio(e.target.value)}
            rows={3}
            placeholder="Ej: EL COSTO DEL ENVÍO SE CALCULARÁ ANTES DE FINALIZAR LA COMPRA..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rosa transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;
