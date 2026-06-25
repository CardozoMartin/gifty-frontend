import { useEffect, useState } from 'react';
import { Plus, X, Save, CreditCard, Truck, AlertCircle, ShoppingCart, Tag, Banknote, Mail, Inbox, CheckCircle, Package, Send, PartyPopper, XCircle } from 'lucide-react';
import { useConfig, useUpdateConfig } from '../../hooks/useConfig';
import { Descuento, EmailNotificaciones } from '../../services/configService';

// ── Editor de lista (métodos de pago / medios de envío) ───────────────────────
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

  const agregar = () => {
    const texto = nuevoItem.trim();
    if (!texto) return;
    onChange([...items, texto]);
    setNuevoItem('');
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#fce7f3] flex items-center justify-center">
          <Icono size={16} className="text-rosa" strokeWidth={1.8} />
        </div>
        <h2 className="text-sm font-semibold text-gray-800">{titulo}</h2>
      </div>

      <div className="space-y-2 mb-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-rosa text-xs mt-0.5">–</span>
            <input
              value={item}
              onChange={(e) => {
                const copia = [...items];
                copia[idx] = e.target.value;
                onChange(copia);
              }}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rosa transition-colors"
            />
            <button
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
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

      <div className="flex gap-2">
        <input
          value={nuevoItem}
          onChange={(e) => setNuevoItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && agregar()}
          placeholder="Agregar nuevo..."
          className="flex-1 border border-dashed border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rosa transition-colors"
        />
        <button
          onClick={agregar}
          className="p-2 bg-[#fce7f3] text-rosa rounded-xl hover:bg-rosa hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

// ── Sección: Descuento efectivo global ───────────────────────────────────────
const SeccionDescuentoEfectivo = ({
  valor,
  onChange,
}: {
  valor: number;
  onChange: (v: number) => void;
}) => {
  const activo = valor > 0;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#fce7f3] flex items-center justify-center">
          <Banknote size={16} className="text-rosa" strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Descuento por pago en efectivo</h2>
          <p className="text-xs text-gray-400 mt-0.5">Se aplica automáticamente a todos los productos cuando el cliente elige efectivo</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-40">
          <input
            type="number"
            min={0}
            max={99}
            value={valor || ''}
            onChange={(e) => onChange(Math.min(99, Math.max(0, Number(e.target.value))))}
            placeholder="0"
            className="w-full px-4 py-3 text-right font-semibold text-gray-800 text-sm outline-none"
          />
          <span className="px-3 text-gray-400 text-sm font-medium border-l border-gray-200 bg-gray-50">%</span>
        </div>

        {activo ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-rosa-suave text-rosa text-xs font-bold px-3 py-1.5 rounded-full">
              {valor}% OFF al pagar en efectivo
            </span>
            <button
              onClick={() => onChange(0)}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              Desactivar
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Desactivado — todos los productos tienen el mismo precio</p>
        )}
      </div>

      {activo && (
        <p className="text-xs text-gray-400 mt-4 bg-gray-50 rounded-xl px-4 py-3">
          Ejemplo: si un producto cuesta <span className="font-semibold text-gray-600">$10.000</span>, al pagar en efectivo se mostrará como{' '}
          <span className="font-semibold text-rosa">
            ${(10000 * (1 - valor / 100)).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </span>.
        </p>
      )}
    </div>
  );
};

// ── Sección: Compra mínima ────────────────────────────────────────────────────
const SeccionCompraMinima = ({
  valor,
  onChange,
}: {
  valor: number;
  onChange: (v: number) => void;
}) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6">
    <div className="flex items-center gap-2 mb-5">
      <div className="w-8 h-8 rounded-lg bg-[#fce7f3] flex items-center justify-center">
        <ShoppingCart size={16} className="text-rosa" strokeWidth={1.8} />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-800">Compra mínima mayorista</h2>
        <p className="text-xs text-gray-400 mt-0.5">Cantidad mínima de productos para poder realizar un pedido</p>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 w-48">
        <span className="text-gray-400 text-sm">Mínimo</span>
        <input
          type="number"
          min={0}
          value={valor || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="0"
          className="w-16 text-right font-semibold text-gray-800 text-sm outline-none"
        />
        <span className="text-gray-400 text-sm">uds.</span>
      </div>
      {valor > 0 ? (
        <p className="text-sm text-gray-500">
          El cliente debe agregar al menos <span className="font-semibold text-marino">{valor} {valor === 1 ? 'producto' : 'productos'}</span> para hacer el pedido.
        </p>
      ) : (
        <p className="text-sm text-gray-400">Sin mínimo configurado (cualquier cantidad es aceptada).</p>
      )}
    </div>
  </div>
);

// ── Sección: Descuentos por monto ────────────────────────────────────────────
const SeccionDescuentos = ({
  descuentos,
  onChange,
}: {
  descuentos: Descuento[];
  onChange: (d: Descuento[]) => void;
}) => {
  const [montoDesde, setMontoDesde] = useState('');
  const [porcentaje, setPorcentaje] = useState('');

  const agregar = () => {
    const monto = Number(montoDesde);
    const pct   = Number(porcentaje);
    if (!monto || !pct || pct < 1 || pct > 99) return;
    const nuevo = [...descuentos, { montoDesde: monto, porcentaje: pct }]
      .sort((a, b) => a.montoDesde - b.montoDesde);
    onChange(nuevo);
    setMontoDesde('');
    setPorcentaje('');
  };

  const eliminar = (idx: number) => onChange(descuentos.filter((_, i) => i !== idx));

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#fce7f3] flex items-center justify-center">
          <Tag size={16} className="text-rosa" strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Descuentos por monto de compra</h2>
          <p className="text-xs text-gray-400 mt-0.5">Se aplica el mayor descuento disponible según el total del pedido</p>
        </div>
      </div>

      {/* Tabla de tramos */}
      {descuentos.length > 0 ? (
        <div className="rounded-xl border border-gray-100 overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-4 py-2.5 font-medium">Monto mínimo del pedido</th>
                <th className="text-center px-4 py-2.5 font-medium">Descuento</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {descuentos.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-marino">{fmt(d.montoDesde)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 bg-rosa-suave text-rosa text-xs font-bold px-2.5 py-1 rounded-full">
                      {d.porcentaje}% OFF
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => eliminar(i)}
                      className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-300 text-center py-4 mb-4">Sin descuentos configurados</p>
      )}

      {/* Agregar nuevo tramo */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1.5">A partir de ($)</label>
          <input
            type="number"
            min={0}
            value={montoDesde}
            onChange={(e) => setMontoDesde(e.target.value)}
            placeholder="Ej: 150000"
            className="w-full border border-dashed border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rosa transition-colors"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs text-gray-400 mb-1.5">Descuento (%)</label>
          <input
            type="number"
            min={1}
            max={99}
            value={porcentaje}
            onChange={(e) => setPorcentaje(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && agregar()}
            placeholder="Ej: 10"
            className="w-full border border-dashed border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rosa transition-colors"
          />
        </div>
        <button
          onClick={agregar}
          className="p-2.5 bg-[#fce7f3] text-rosa rounded-xl hover:bg-rosa hover:text-white transition-colors mb-0.5"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

// ── Página de configuración del admin ────────────────────────────────────────
const AdminConfig = () => {
  const { data: config, isLoading } = useConfig();
  const updateConfig = useUpdateConfig();

  const [metodosPago, setMetodosPago]               = useState<string[]>([]);
  const [mediosEnvio, setMediosEnvio]               = useState<string[]>([]);
  const [notaEnvio, setNotaEnvio]                   = useState('');
  const [compraMinima, setCompraMinima]             = useState(0);
  const [descuentos, setDescuentos]                 = useState<Descuento[]>([]);
  const [descuentoEfectivo, setDescuentoEfectivo]   = useState(0);
  const [emailNotificaciones, setEmailNotificaciones] = useState<EmailNotificaciones>({
    pedidoRecibido: true,
    pedidoConfirmado: true,
    pedidoEnPreparacion: true,
    pedidoEnviado: true,
    pedidoEntregado: true,
    pedidoCancelado: true,
  });
  const [guardado, setGuardado]                     = useState(false);

  useEffect(() => {
    if (config) {
      setMetodosPago(config.metodosPago);
      setMediosEnvio(config.mediosEnvio);
      setNotaEnvio(config.notaEnvio);
      setCompraMinima(config.compraMinima ?? 0);
      setDescuentos(config.descuentos ?? []);
      setDescuentoEfectivo(config.descuentoEfectivo ?? 0);
      if (config.emailNotificaciones) {
        setEmailNotificaciones(config.emailNotificaciones);
      }
    }
  }, [config]);

  const toggleEmail = (clave: keyof EmailNotificaciones) =>
    setEmailNotificaciones((prev) => ({ ...prev, [clave]: !prev[clave] }));

  const handleGuardar = async () => {
    await updateConfig.mutateAsync({ metodosPago, mediosEnvio, notaEnvio, compraMinima, descuentos, descuentoEfectivo, emailNotificaciones });
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
          style={{ background: guardado ? '#10b981' : '#FF77EC' }}
        >
          <Save size={14} />
          {updateConfig.isPending ? 'Guardando...' : guardado ? '¡Guardado!' : 'Guardar cambios'}
        </button>
      </div>

      <div className="space-y-5">

        {/* Compra mínima */}
        <SeccionCompraMinima valor={compraMinima} onChange={setCompraMinima} />

        {/* Descuento efectivo global */}
        <SeccionDescuentoEfectivo valor={descuentoEfectivo} onChange={setDescuentoEfectivo} />

        {/* Descuentos por monto */}
        <SeccionDescuentos descuentos={descuentos} onChange={setDescuentos} />

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

        {/* Notificaciones por email */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#fce7f3] flex items-center justify-center">
              <Mail size={16} className="text-rosa" strokeWidth={1.8} />
            </div>
            <h2 className="text-sm font-semibold text-gray-800">Notificaciones por email al cliente</h2>
          </div>
          <p className="text-xs text-gray-400 mb-5">Activá o desactivá cada email que se envía automáticamente al cliente.</p>

          <div className="space-y-3">
            {(
              [
                { clave: 'pedidoRecibido',      Icono: Inbox,       color: '#f59e0b', bg: '#fef3c7', label: 'Pedido recibido',   desc: 'Al crear el pedido' },
                { clave: 'pedidoConfirmado',    Icono: CheckCircle, color: '#3b82f6', bg: '#eff6ff', label: 'Pedido confirmado',  desc: 'Al confirmar el pago' },
                { clave: 'pedidoEnPreparacion', Icono: Package,     color: '#8b5cf6', bg: '#f5f3ff', label: 'En preparación',     desc: 'Al comenzar a armar el pedido' },
                { clave: 'pedidoEnviado',       Icono: Send,        color: '#6366f1', bg: '#eef2ff', label: 'Pedido enviado',     desc: 'Al despachar el pedido' },
                { clave: 'pedidoEntregado',     Icono: PartyPopper, color: '#10b981', bg: '#ecfdf5', label: 'Pedido entregado',   desc: 'Al marcar como entregado' },
                { clave: 'pedidoCancelado',     Icono: XCircle,     color: '#ef4444', bg: '#fef2f2', label: 'Pedido cancelado',   desc: 'Al cancelar el pedido' },
              ] as const
            ).map(({ clave, Icono, color, bg, label, desc }) => (
              <label key={clave} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                    <Icono size={15} style={{ color }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEmail(clave)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    emailNotificaciones[clave] ? 'bg-rosa' : 'bg-gray-200'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    emailNotificaciones[clave] ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminConfig;
