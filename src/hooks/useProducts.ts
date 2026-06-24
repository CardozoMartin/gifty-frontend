import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProducts,
  getProductsAdmin,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../services/productService';
import { Categoria, ProductoFormData } from '../types/producto';

// Claves de caché para TanStack Query — centralizadas para evitar typos
export const QUERY_KEYS = {
  productos: 'productos',
  productosAdmin: 'productos-admin',
  productoSlug: (slug: string) => ['producto', slug],
  productoId: (id: string) => ['producto-admin', id],
};

// Hook para obtener la lista pública de productos (tienda)
export const useProducts = (categoria?: Categoria, busqueda?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.productos, categoria, busqueda],
    queryFn: () => getProducts(categoria, busqueda),
  });
};

// Hook para obtener todos los productos en el panel admin
export const useProductsAdmin = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.productosAdmin],
    queryFn: getProductsAdmin,
  });
};

// Hook para obtener el detalle de un producto por slug (página pública)
export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.productoSlug(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug, // solo ejecuta si hay slug
  });
};

// Hook para obtener un producto por ID (edición en admin)
export const useProductById = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.productoId(id),
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
};

// Hook para crear un producto (mutation con invalidación de caché)
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos: ProductoFormData) => createProduct(datos),
    onSuccess: () => {
      // Invalida la caché del admin para que recargue la lista actualizada
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.productosAdmin] });
    },
  });
};

// Hook para actualizar un producto
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: Partial<ProductoFormData> }) =>
      updateProduct(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.productosAdmin] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.productos] });
    },
  });
};

// Hook para eliminar un producto
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.productosAdmin] });
    },
  });
};

// Hook para subir imagen de un producto
export const useUploadProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, archivo }: { id: string; archivo: File }) =>
      uploadProductImage(id, archivo),
    onSuccess: (_data, variables) => {
      // Invalida solo el producto específico para refrescar sus imágenes
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productoId(variables.id) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.productosAdmin] });
    },
  });
};
