// Categorías disponibles (deben coincidir con el servidor)
export type Categoria =
  | 'tazas'
  | 'mates'
  | 'botellas'
  | 'libreria'
  | 'box'
  | 'cotillon'
  | 'otros';

// Producto tal como llega desde la API
export interface Producto {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioEfectivo: number;
  categoria: Categoria;
  imagenes: string[];
  stock: number;
  cantidadMinima: number;
  activo: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

// Datos que se envían al crear o editar un producto desde el admin
export interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  precioEfectivo: number;
  categoria: Categoria;
  stock: number;
  cantidadMinima: number;
  activo: boolean;
}
