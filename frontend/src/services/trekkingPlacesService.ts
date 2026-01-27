import { apiClient } from '../config/api';
import type { TrekkingPlacesResponse, SearchTrekkingPlacesParams } from '../types';

export const trekkingPlacesService = {
  async searchPlaces(params: SearchTrekkingPlacesParams): Promise<TrekkingPlacesResponse> {
    const response = await apiClient.get<TrekkingPlacesResponse>('/trekking-places', {
      params,
    });
    return response.data;
  },
};
