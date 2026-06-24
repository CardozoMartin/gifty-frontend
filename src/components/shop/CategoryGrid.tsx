import { Link } from 'react-router-dom';
import libreriaImg from '../../img/Libreria.jpg';
import matesImg from '../../img/Mates.jpg';
import botellasImg from '../../img/Botellas.jpg';
import tazasImg from '../../img/Tazas.jpg';
import boxImg from '../../img/Box.jpg';

// Categorías con sus imágenes reales
const categorias = [
  { nombre: 'Librería', slug: 'libreria', imagen: libreriaImg },
  { nombre: 'Mates',    slug: 'mates',    imagen: matesImg },
  { nombre: 'Botellas', slug: 'botellas', imagen: botellasImg },
  { nombre: 'Tazas',    slug: 'tazas',    imagen: tazasImg },
  { nombre: 'Box',      slug: 'box',      imagen: boxImg },
];

// Grid de categorías replicando el diseño original:
// Fila superior: imagen + nombre debajo en texto uppercase
// Fila inferior: mismas imágenes repetidas sin texto (como en el original)
const CategoryGrid = () => {
  return (
    <section className="w-full px-4 sm:px-10 lg:px-32 py-8">

      {/* En mobile 1 columna apilada, tablet 3, desktop 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {categorias.map((cat) => (
          <Link
            key={cat.slug}
            to={`/tienda?categoria=${cat.slug}`}
            className="group overflow-hidden aspect-[3/2] sm:aspect-[2/3]"
          >
            <img
              src={cat.imagen}
              alt={cat.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
        ))}
      </div>

    </section>
  );
};

export default CategoryGrid;
