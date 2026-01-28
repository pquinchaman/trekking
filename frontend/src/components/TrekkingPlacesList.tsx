import type { TrekkingPlace } from '../types';
import { TrekkingPlaceCard } from './TrekkingPlaceCard';
import { AIRecommendation } from './AIRecommendation';

interface TrekkingPlacesListProps {
  places: TrekkingPlace[];
  total: number;
  aiRecommendation?: string;
}

export const TrekkingPlacesList = ({ places, total, aiRecommendation }: TrekkingPlacesListProps) => {
  if (places.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🏔️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No se encontraron lugares</h3>
          <p className="text-gray-600">
            Intenta ajustar tus criterios de búsqueda o usar la búsqueda inteligente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {aiRecommendation && <AIRecommendation recommendation={aiRecommendation} />}
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Resultados encontrados
          </h2>
          <p className="text-gray-600 mt-1">
            Se encontraron <span className="font-semibold text-primary-600">{total}</span> lugares de trekking
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place) => (
          <TrekkingPlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
};
