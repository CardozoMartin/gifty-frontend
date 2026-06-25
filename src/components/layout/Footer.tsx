import { useEffect, useRef, useState } from 'react';
import { Phone, Mail, MapPin, Instagram } from 'lucide-react';
import logoFooter from '../../img/icono-footer.png';

const Footer = () => {
  const logoRef = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (logoRef.current) observer.observe(logoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="mt-16" style={{ background: '#FFD3DB' }}>


      {/* Instagram */}
      <div className="py-6 text-center border-y-4 border-white bg-white">
        <a
          href="https://www.instagram.com/giftytu"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-col items-center gap-1 text-rosa hover:opacity-80 transition-opacity"
        >
          <Instagram size={28} strokeWidth={1.5} />
          <span className="text-base" style={{ fontFamily: '"Satisfy", cursive' }}>@giftytu</span>
        </a>
      </div>

      {/* Logo y contacto */}
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">

            {/* Logo con animación */}
            <img
              ref={logoRef}
              src={logoFooter}
              alt="Gifty Mayorista"
              className={`w-44 md:w-52 object-contain flex-shrink-0 ${visible ? 'animate-flip-in' : 'rotate-180 opacity-0'}`}
            />

            {/* Datos de contacto */}
            <div>
              <h4 className="text-rosa text-2xl mb-5" style={{ fontFamily: '"Satisfy", cursive' }}>Contacto</h4>
              <ul className="space-y-3 text-sm text-marino">
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-marino shrink-0" />
                  <span>+54 381 5230893</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-marino shrink-0" />
                  <span>contacto@giftytu.com.ar</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-marino shrink-0 mt-0.5" />
                  <span>Santiago del Estero 676, San Miguel de Tucumán</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-pink-200 py-4 text-center text-xs text-marino/60">
        Sitio desarrollado por{' '}
        <a href="https://tuyotienda.com.ar" target="_blank" rel="noopener noreferrer" className="text-rosa hover:underline">
          Tuyo Tienda
        </a>
      </div>

    </footer>
  );
};

export default Footer;
