import api from './api';

export interface Descuento {
  montoDesde: number;
  porcentaje: number;
}

export interface EmailNotificaciones {
  pedidoRecibido: boolean;
  pedidoConfirmado: boolean;
  pedidoEnPreparacion: boolean;
  pedidoEnviado: boolean;
  pedidoEntregado: boolean;
  pedidoCancelado: boolean;
}

export interface ConfigData {
  _id: string;
  metodosPago: string[];
  mediosEnvio: string[];
  notaEnvio: string;
  compraMinima: number;
  descuentos: Descuento[];
  descuentoEfectivo: number;
  emailNotificaciones: EmailNotificaciones;
}

export const getConfig = async (): Promise<ConfigData> => {
  const { data } = await api.get('/config');
  return data.data;
};

export const updateConfig = async (datos: Partial<Omit<ConfigData, '_id'>>): Promise<ConfigData> => {
  const { data } = await api.put('/config', datos);
  return data.data;
};
