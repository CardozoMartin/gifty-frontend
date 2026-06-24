import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useCreateOrder } from '../hooks/useOrders';
import { DatosCliente } from '../types/pedido';

// Formatea precio en pesos argentinos
const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);

// Métodos de pago disponibles
const metodosPago = [
  { valor: 'transferencia', label: 'Transferencia bancaria' },
  { valor: 'efectivo', label: 'Efectivo (precio especial)' },
  { valor: 'mercadopago', label: 'Mercado Pago' },
];

// Página de checkout: datos del cliente + resumen del pedido + confirmación
const Checkout = () => {
  const { items, total, itemsParaPedido, vaciarCarrito } = useCart();
  const crearPedido = useCreateOrder();

  // Estado de la pantalla de éxito post-compra
  const [pedidoConfirmado, setPedidoConfirmado] = useState<string | null>(null);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('transferencia');

  // Formulario de datos del cliente con react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosCliente & { notas?: string }>();

  // Si el carrito está vacío redirigimos a la tienda
  if (items.length === 0 && !pedidoConfirmado) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Tu carrito está vacío.</p>
        <Link to="/tienda" className="btn-primario">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  // Envía el pedido a la API y muestra la pantalla de éxito
  const onSubmit = async (datos: DatosCliente & { notas?: string }) => {
    const { notas, ...cliente } = datos;

    const pedido = await crearPedido.mutateAsync({
      cliente,
      items: itemsParaPedido,
      metodoPago: metodoPagoSeleccionado,
      notas,
    });

    // Guardamos el número de pedido y vaciamos el carrito
    setPedidoConfirmado(pedido.numeroPedido);
    vaciarCarrito();
  };

  // ── Pantalla de confirmación exitosa ─────────────────────────────────────
  if (pedidoConfirmado) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-marino mb-2">¡Pedido realizado!</h1>
        <p className="text-gray-500 mb-1">
          Tu número de pedido es:
        </p>
        <p className="text-2xl font-mono font-bold text-rosa mb-6">
          {pedidoConfirmado}
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Recibirás un correo con los detalles del pedido y las instrucciones de pago.
          Nos pondremos en contacto a la brevedad para coordinar el envío.
        </p>
        <Link to="/tienda" className="btn-primario">
          Seguir comprando
        </Link>
      </div>
    );
  }

  // ── Formulario de checkout ────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Link
        to="/tienda"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-rosa mb-6"
      >
        <ChevronLeft size={16} />
        Volver a la tienda
      </Link>

      <h1 className="text-2xl font-bold text-marino mb-8">Finalizar compra</h1>

      <div className="lg:grid lg:grid-cols-3 lg:gap-12">
        {/* ── Formulario de datos — ocupa 2 columnas ─────────────────────── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-2 space-y-6"
        >
          {/* Sección: datos personales */}
          <fieldset className="bg-white rounded-xl border border-gray-100 p-6">
            <legend className="text-base font-semibold text-marino mb-4 px-1">
              Datos personales
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre completo */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-marino mb-1">
                  Nombre completo *
                </label>
                <input
                  {...register('nombre', { required: 'El nombre es obligatorio' })}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-rosa"
                  placeholder="Juan García"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-marino mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'El email es obligatorio',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Email inválido',
                    },
                  })}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-rosa"
                  placeholder="juan@empresa.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-marino mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  {...register('telefono', { required: 'El teléfono es obligatorio' })}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-rosa"
                  placeholder="+54 381 000 0000"
                />
                {errors.telefono && (
                  <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>
                )}
              </div>

              {/* Empresa (opcional) */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-marino mb-1">
                  Empresa / Negocio
                  <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                </label>
                <input
                  {...register('empresa')}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-rosa"
                  placeholder="Nombre de tu negocio"
                />
              </div>
            </div>
          </fieldset>

          {/* Sección: dirección de entrega */}
          <fieldset className="bg-white rounded-xl border border-gray-100 p-6">
            <legend className="text-base font-semibold text-marino mb-4 px-1">
              Dirección de entrega
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dirección */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-marino mb-1">
                  Dirección *
                </label>
                <input
                  {...register('direccion', { required: 'La dirección es obligatoria' })}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-rosa"
                  placeholder="Av. Principal 123, Piso 2"
                />
                {errors.direccion && (
                  <p className="text-red-500 text-xs mt-1">{errors.direccion.message}</p>
                )}
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-marino mb-1">
                  Ciudad *
                </label>
                <input
                  {...register('ciudad', { required: 'La ciudad es obligatoria' })}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-rosa"
                  placeholder="San Miguel de Tucumán"
                />
                {errors.ciudad && (
                  <p className="text-red-500 text-xs mt-1">{errors.ciudad.message}</p>
                )}
              </div>

              {/* Provincia */}
              <div>
                <label className="block text-sm font-medium text-marino mb-1">
                  Provincia *
                </label>
                <input
                  {...register('provincia', { required: 'La provincia es obligatoria' })}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-rosa"
                  placeholder="Tucumán"
                />
                {errors.provincia && (
                  <p className="text-red-500 text-xs mt-1">{errors.provincia.message}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Sección: método de pago */}
          <fieldset className="bg-white rounded-xl border border-gray-100 p-6">
            <legend className="text-base font-semibold text-marino mb-4 px-1">
              Método de pago
            </legend>

            <div className="space-y-3">
              {metodosPago.map((metodo) => (
                <label
                  key={metodo.valor}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    metodoPagoSeleccionado === metodo.valor
                      ? 'border-rosa bg-rosa-suave'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value={metodo.valor}
                    checked={metodoPagoSeleccionado === metodo.valor}
                    onChange={() => setMetodoPagoSeleccionado(metodo.valor)}
                    className="accent-rosa"
                  />
                  <span className="text-sm font-medium text-marino">
                    {metodo.label}
                  </span>
                  {/* Aviso especial para precio efectivo */}
                  {metodo.valor === 'efectivo' && (
                    <span className="ml-auto text-xs text-rosa font-semibold">
                      ¡Precio especial!
                    </span>
                  )}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Notas adicionales */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <label className="block text-sm font-medium text-marino mb-2">
              Notas adicionales
              <span className="text-gray-400 font-normal ml-1">(opcional)</span>
            </label>
            <textarea
              {...register('notas')}
              rows={3}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-rosa resize-none"
              placeholder="Instrucciones de entrega, horarios, aclaraciones..."
            />
          </div>

          {/* Botón de confirmar — visible en móvil debajo del form */}
          <button
            type="submit"
            disabled={isSubmitting || crearPedido.isPending}
            className="btn-primario w-full py-3 text-base lg:hidden disabled:opacity-60"
          >
            {crearPedido.isPending ? 'Procesando pedido...' : 'Confirmar pedido'}
          </button>

          {/* Error de la API */}
          {crearPedido.isError && (
            <p className="text-red-500 text-sm text-center">
              {crearPedido.error?.message || 'Ocurrió un error al procesar el pedido'}
            </p>
          )}
        </form>

        {/* ── Resumen del pedido — columna derecha ───────────────────────── */}
        <div className="mt-8 lg:mt-0">
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-bold text-marino mb-4">Resumen del pedido</h2>

            {/* Lista de ítems */}
            <ul className="space-y-3 mb-4">
              {items.map((item) => (
                <li key={item.producto._id} className="flex gap-3 items-start">
                  <img
                    src={item.producto.imagenes[0] || '/placeholder.jpg'}
                    alt={item.producto.nombre}
                    className="w-12 h-12 object-cover rounded border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-marino truncate">
                      {item.producto.nombre}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.cantidad} × {formatearPrecio(item.producto.precio)}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-rosa shrink-0">
                    {formatearPrecio(item.producto.precio * item.cantidad)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Separador */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatearPrecio(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Envío</span>
                <span className="text-green-600">A coordinar</span>
              </div>
              <div className="flex justify-between text-base font-bold text-marino pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-rosa">{formatearPrecio(total)}</span>
              </div>
            </div>

            {/* Botón de confirmar — visible en desktop en la columna lateral */}
            <button
              type="submit"
              form="checkout-form"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || crearPedido.isPending}
              className="btn-primario w-full mt-5 py-3 hidden lg:block disabled:opacity-60"
            >
              {crearPedido.isPending ? 'Procesando...' : 'Confirmar pedido'}
            </button>

            {/* Aviso de seguridad */}
            <p className="text-xs text-gray-400 text-center mt-3">
              Al confirmar aceptás nuestras condiciones de venta mayorista.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
