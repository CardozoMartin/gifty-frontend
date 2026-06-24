import { Phone, Mail, MapPin, Instagram } from 'lucide-react';

// Footer del sitio con contacto e Instagram — basado en el diseño original de Gifty
const Footer = () => {
  return (
    <footer className="bg-rosa-suave mt-16">
      {/* Sección de newsletter */}
      <div className="bg-marino text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex items-center justify-between gap-8">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-semibold italic">¡Mantente informado!</h3>
              <p className="text-gray-300 text-sm mt-1">
                Sé el primero en enterarte sobre todas nuestras promociones exclusivas,
                ofertas y novedades.
              </p>
            </div>
            {/* Formulario simple de newsletter */}
            <form className="flex flex-col sm:flex-row gap-2 w-full md:max-w-md">
              <input
                type="text"
                placeholder="Nombre"
                className="flex-1 px-3 py-2 rounded text-gray-800 text-sm outline-none"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                className="flex-1 px-3 py-2 rounded text-gray-800 text-sm outline-none"
              />
              <button className="bg-rosa hover:bg-rosa-claro text-white px-4 py-2 rounded text-sm font-semibold transition-colors">
                Suscribir
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Instagram y contacto */}
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

            {/* Instagram */}
            <div className="mb-8 md:mb-0 text-center">
              <a
                href="https://www.instagram.com/giftytu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-rosa font-semibold hover:underline"
              >
                <Instagram size={20} />
                @giftytu
              </a>
            </div>

            {/* Datos de contacto */}
            <div>
              <h4 className="text-marino font-bold text-lg mb-4">Contacto</h4>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-rosa shrink-0" />
                  <span>+54 381 5230893</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-rosa shrink-0" />
                  <span>contacto@giftytu.com.ar</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-rosa shrink-0 mt-0.5" />
                  <span>Santiago del Estero 676, San Miguel de Tucumán</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-rosa-claro py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Gifty Mayorista. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
