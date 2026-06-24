import api from './api';

export interface ConfigData {
  _id: string;
  metodosPago: string[];
  mediosEnvio: string[];
  notaEnvio: string;
}

export const getConfig = async (): Promise<ConfigData> => {
  const { data } = await api.get('/config');
  return data.data;
};

export const updateConfig = async (datos: Partial<Omit<ConfigData, '_id'>>): Promise<ConfigData> => {
  const { data } = await api.put('/config', datos);
  return data.data;
};
