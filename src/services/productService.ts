import api from './api';
import { Producto, ProductoFormData, Categoria } from '../types/producto';

// Estructura de respuesta estándar de la API
interface RespuestaApi<T> {
  ok: boolean;
  datos: T;
}

// Obtiene la lista de productos públicos con filtros opcionales
export const getProducts = async (
  categoria?: Categoria,
  busqueda?: string
): Promise<Producto[]> => {
  // Armamos los query params solo si tienen valor
  const params: Record<string, string> = {};
  if (categoria) params.categoria = categoria;
  if (busqueda) params.busqueda = busqueda;

  const respuesta = await api.get<RespuestaApi<Producto[]>>('/productos', { params });
  return respuesta.data.datos;
};

// Obtiene todos los productos para el panel admin (incluye inactivos)
export const getProductsAdmin = async (): Promise<Producto[]> => {
  const respuesta = await api.get<RespuestaApi<Producto[]>>('/productos/admin/todos');
  return respuesta.data.datos;
};

// Obtiene un producto por su slug (página de detalle pública)
export const getProductBySlug = async (slug: string): Promise<Producto> => {
  const respuesta = await api.get<RespuestaApi<Producto>>(`/productos/${slug}`);
  return respuesta.data.datos;
};

// Obtiene un producto por ID (edición en el admin)
export const getProductById = async (id: string): Promise<Producto> => {
  const respuesta = await api.get<RespuestaApi<Producto>>(`/productos/admin/${id}`);
  return respuesta.data.datos;
};

// Crea un nuevo producto
export const createProduct = async (datos: ProductoFormData): Promise<Producto> => {
  const respuesta = await api.post<RespuestaApi<Producto>>('/productos/admin', datos);
  return respuesta.data.datos;
};

// Actualiza un producto existente
export const updateProduct = async (
  id: string,
  datos: Partial<ProductoFormData>
): Promise<Producto> => {
  const respuesta = await api.put<RespuestaApi<Producto>>(`/productos/admin/${id}`, datos);
  return respuesta.data.datos;
};

// Elimina un producto
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/productos/admin/${id}`);
};

// Sube una imagen para un producto usando FormData (multipart)
export const uploadProductImage = async (
  id: string,
  archivo: File
): Promise<Producto> => {
  const formData = new FormData();
  formData.append('imagen', archivo);

  const respuesta = await api.post<RespuestaApi<Producto>>(
    `/productos/admin/${id}/imagen`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return respuesta.data.datos;
};
