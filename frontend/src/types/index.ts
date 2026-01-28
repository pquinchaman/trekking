export const DifficultyLevel = {
  EASY: 'easy',
  MODERATE: 'moderate',
  HARD: 'hard',
  EXPERT: 'expert',
} as const;

export type DifficultyLevel = typeof DifficultyLevel[keyof typeof DifficultyLevel];

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface TrekkingPlace {
  id: string;
  name: string;
  type: string;
  coordinates: Coordinates;
  description?: string;
  difficulty?: string;
  distance?: number;
  duration?: number;
  elevation?: number;
  source: string;
  osmUrl?: string;
}

export interface TrekkingPlacesResponse {
  places: TrekkingPlace[];
  total: number;
  limit: number;
  aiRecommendation?: string;
}

export interface SearchTrekkingPlacesParams {
  lat?: number;
  lon?: number;
  radius?: number;
  difficulty?: DifficultyLevel;
  name?: string;
  limit?: number;
  query?: string;
}
