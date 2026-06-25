import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAuthService, PerfilData } from '../services/userAuthService';
import { useUserAuthStore } from '../store/userAuthStore';

const QUERY_KEY = 'perfil-usuario';

// Hook para traer el perfil completo del usuario autenticado
export const usePerfil = () => {
  const estaAutenticado = useUserAuthStore((s) => s.estaAutenticado);
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => userAuthService.getPerfil().then((r) => r.usuario),
    enabled: estaAutenticado,
    staleTime: 1000 * 60 * 5,
  });
};

// Hook para actualizar el perfil y sincronizar el store de auth
export const useUpdatePerfil = () => {
  const queryClient = useQueryClient();
  const setUsuario = useUserAuthStore((s) => s.setUsuario);

  return useMutation({
    mutationFn: (datos: PerfilData) => userAuthService.updatePerfil(datos),
    onSuccess: (res) => {
      // Actualiza el store de auth con los datos nuevos
      setUsuario(res.usuario);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
