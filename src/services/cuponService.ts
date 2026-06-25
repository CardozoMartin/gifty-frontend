import api from './api';

export interface Cupon {
  _id: string;
  codigo: string;
  tipo: 'porcentaje' | 'monto';
  valor: number;
  activo: boolean;
  fechaVencimiento?: string;
  usosMaximos?: number;
  usosActuales: number;
  unUsorPorUsuario: boolean;
  createdAt: string;
}

export interface CuponInput {
  codigo: string;
  tipo: 'porcentaje' | 'monto';
  valor: number;
  fechaVencimiento?: string;
  usosMaximos?: number;
  unUsorPorUsuario?: boolean;
}

export const cuponService = {
  listar: async (): Promise<Cupon[]> => {
    const res = await api.get('/cupones');
    return res.data.cupones;
  },

  crear: async (datos: CuponInput): Promise<Cupon> => {
    const res = await api.post('/cupones', datos);
    return res.data.cupon;
  },

  editar: async (id: string, datos: Partial<CuponInput & { activo: boolean }>): Promise<Cupon> => {
    const res = await api.put(`/cupones/${id}`, datos);
    return res.data.cupon;
  },

  eliminar: async (id: string): Promise<void> => {
    await api.delete(`/cupones/${id}`);
  },

  validar: async (codigo: string, total: number): Promise<{ cupon: Cupon; descuento: number }> => {
    const res = await api.post('/cupones/validar', { codigo, total });
    return res.data;
  },
};
