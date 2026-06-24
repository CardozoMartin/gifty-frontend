import { Link } from 'react-router-dom';
import {
  Monitor,
  ShoppingBag,
  MousePointerClick,
  ClipboardList,
  Truck,
  DollarSign,
  Mail,
  CreditCard,
  Banknote,
  Smartphone,
  Package,
  Clock,
  MapPin,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

// ── Datos de los 7 pasos del proceso de compra ────────────────────────────
const pasos = [
  { numero: 1, icono: Monitor, descripcion: 'Navegá por nuestra tienda online' },
  { numero: 2, icono: ShoppingBag, descripcion: 'Añadé los productos a tu bolsa de compras' },
  { numero: 3, icono: MousePointerClick, descripcion: 'Presioná «comprar» dentro del carrito' },
  { numero: 4, icono: ClipboardList, descripcion: 'Completá tus datos cuidadosamente' },
  { numero: 5, icono: Truck, descripcion: 'Seleccioná el método de envío preferido' },
  { numero: 6, icono: DollarSign, descripcion: 'Elegí cómo te gustaría pagar tu compra' },
  { numero: 7, icono: Mail, descripcion: '¡Listo! Recibirás un mail confirmando tu compra' },
];

// ── Medios de pago aceptados ──────────────────────────────────────────────
const mediosPago = [
  {
    icono: Banknote,
    titulo: 'Efectivo',
    descripcion: 'Pagando en efectivo obtenés un descuento especial en todos los productos.',
    destaca: true,
  },
  {
    icono: CreditCard,
    titulo: 'Transferencia bancaria',
    descripcion: 'Transferí al alias o CBU que te enviamos por email al confirmar tu pedido.',
    destaca: false,
  },
  {
    icono: Smartphone,
    titulo: 'Mercado Pago',
    descripcion: 'Podés pagar con saldo de Mercado Pago, tarjeta de débito o crédito.',
    destaca: false,
  },
];

// ── Info de envíos ────────────────────────────────────────────────────────
const infoEnvios = [
  {
    icono: Package,
    titulo: 'Envíos a todo el país',
    descripcion:
      'Despachamos por Andreani, OCA o el correo que prefieras. El costo de envío se calcula según el peso del pedido y se coordina por WhatsApp antes de confirmar.',
  },
  {
    icono: Clock,
    titulo: 'Plazo de preparación',
    descripcion:
      'Los pedidos mayoristas se preparan en 1 a 3 días hábiles. Te avisamos por email cuando el paquete es despachado.',
  },
  {
    icono: MapPin,
    titulo: 'Retiro en local',
    descripcion:
      'Si estás en Tucumán podés retirar sin costo en nuestro local: Santiago del Estero 676, San Miguel de Tucumán. Coordiná el horario por WhatsApp.',
  },
];

// ── Preguntas frecuentes de mayoristas ───────────────────────────────────
const preguntas = [
  {
    pregunta: '¿Cuál es la cantidad mínima de compra?',
    respuesta:
      'Cada producto tiene su cantidad mínima mayorista indicada en la ficha (generalmente 6 unidades por producto). No hay un monto mínimo total de pedido.',
  },
  {
    pregunta: '¿Los precios ya tienen IVA incluido?',
    respuesta:
      'Sí, todos los precios publicados en la tienda mayorista incluyen IVA. No hay cargos adicionales ocultos.',
  },
  {
    pregunta: '¿Puedo mezclar colores o modelos dentro de un mismo producto?',
    respuesta:
      'En la mayoría de los casos sí. Indicalo en las notas del pedido o consultanos por WhatsApp antes de comprar.',
  },
  {
    pregunta: '¿Cómo me entero de nuevas colecciones y promociones?',
    respuesta:
      'Suscribite al newsletter en la página de inicio o seguinos en Instagram @giftytu para ver las novedades antes que nadie.',
  },
  {
    pregunta: '¿Puedo hacer un pedido personalizado o con logo?',
    respuesta:
      'Sí, tenemos opción de personalización para algunos productos. Escribinos por WhatsApp con el detalle de lo que necesitás y te enviamos presupuesto.',
  },
];

// ── Componente acordeón para cada pregunta frecuente ─────────────────────
const PreguntaAcordeon = ({ pregunta, respuesta }: { pregunta: string; respuesta: string }) => {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-sm font-medium text-marino">{pregunta}</span>
        {abierto ? (
          <ChevronUp size={18} className="text-rosa shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-gray-400 shrink-0" />
        )}
      </button>
      {/* Contenido colapsable */}
      {abierto && (
        <p className="text-sm text-gray-600 leading-relaxed pb-4">{respuesta}</p>
      )}
    </div>
  );
};

// ── Página principal Cómo Comprar ─────────────────────────────────────────
const HowToBuy = () => {
  return (
    <div>
      {/* ── Hero de sección ───────────────────────────────────────────── */}
      <div className="bg-rosa-suave py-12 text-center">
        <h1 className="text-3xl font-light text-marino italic mb-2">
          Pasos para realizar tu compra
        </h1>
        <p className="text-gray-500 text-sm">
          Comprá fácil y rápido desde donde estés
        </p>
      </div>

      {/* ── Los 7 pasos ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
          {pasos.map((paso) => {
            const Icono = paso.icono;
            return (
              <div key={paso.numero} className="flex flex-col items-center text-center">
                {/* Número en rosa grande */}
                <span className="text-5xl font-light text-rosa mb-3 leading-none">
                  {paso.numero}
                </span>
                {/* Ícono con stroke fino como en el diseño original */}
                <div className="w-16 h-16 flex items-center justify-center mb-3">
                  <Icono size={42} className="text-rosa opacity-50" strokeWidth={1} />
                </div>
                <p className="text-sm text-gray-600 leading-snug">{paso.descripcion}</p>
              </div>
            );
          })}
        </div>

        {/* CTA hacia la tienda */}
        <div className="text-center mt-14">
          <Link to="/tienda" className="btn-primario px-10 py-3 text-sm">
            Ir a la tienda
          </Link>
        </div>
      </section>

      {/* ── Medios de pago ───────────────────────────────────────────── */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-marino text-center mb-10">
            Medios de pago
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {mediosPago.map((medio) => {
              const Icono = medio.icono;
              return (
                <div
                  key={medio.titulo}
                  className={`rounded-xl p-6 text-center border-2 transition-colors ${
                    medio.destaca
                      ? 'border-rosa bg-white'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  {/* Badge "Precio especial" solo en efectivo */}
                  {medio.destaca && (
                    <span className="inline-block bg-rosa text-white text-xs font-bold px-3 py-0.5 rounded-full mb-3">
                      ¡Precio especial!
                    </span>
                  )}
                  <div className="w-12 h-12 bg-rosa-suave rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icono size={24} className="text-rosa" />
                  </div>
                  <h3 className="font-semibold text-marino mb-2">{medio.titulo}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {medio.descripcion}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Información de envíos ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-xl font-bold text-marino text-center mb-10">
          Envíos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {infoEnvios.map((info) => {
            const Icono = info.icono;
            return (
              <div key={info.titulo} className="flex gap-4">
                {/* Ícono con fondo circular rosa */}
                <div className="w-11 h-11 bg-rosa-suave rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Icono size={20} className="text-rosa" />
                </div>
                <div>
                  <h3 className="font-semibold text-marino text-sm mb-1">
                    {info.titulo}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {info.descripcion}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Preguntas frecuentes ──────────────────────────────────────── */}
      <section className="bg-rosa-suave py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <HelpCircle size={22} className="text-rosa" />
            <h2 className="text-xl font-bold text-marino">
              Preguntas frecuentes
            </h2>
          </div>

          {/* Lista de acordeones */}
          <div className="bg-white rounded-xl px-6 divide-y divide-gray-100 shadow-sm">
            {preguntas.map((item) => (
              <PreguntaAcordeon
                key={item.pregunta}
                pregunta={item.pregunta}
                respuesta={item.respuesta}
              />
            ))}
          </div>

          {/* Contacto por WhatsApp para más dudas */}
          <p className="text-center text-sm text-gray-500 mt-8">
            ¿Tenés otra consulta?{' '}
            <a
              href="https://wa.me/5493815230893"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rosa font-semibold hover:underline"
            >
              Escribinos por WhatsApp
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default HowToBuy;
