import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConfig, updateConfig, ConfigData } from '../services/configService';

const QUERY_KEY = 'config';

export const useConfig = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getConfig,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: Partial<Omit<ConfigData, '_id'>>) => updateConfig(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
