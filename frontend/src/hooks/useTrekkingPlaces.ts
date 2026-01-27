import { useQuery } from '@tanstack/react-query';
import { trekkingPlacesService } from '../services/trekkingPlacesService';
import type { SearchTrekkingPlacesParams } from '../types';

export const useTrekkingPlaces = (params: SearchTrekkingPlacesParams | null) => {
  return useQuery({
    queryKey: ['trekking-places', params],
    queryFn: () => {
      if (!params || Object.keys(params).length === 0) {
        throw new Error('Los parámetros de búsqueda son requeridos');
      }
      return trekkingPlacesService.searchPlaces(params);
    },
    enabled: params !== null && Object.keys(params).length > 0,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
