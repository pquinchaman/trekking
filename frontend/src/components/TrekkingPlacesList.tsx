import type { TrekkingPlace } from '../types';
import { TrekkingPlaceCard } from './TrekkingPlaceCard';

interface TrekkingPlacesListProps {
  places: TrekkingPlace[];
  total: number;
}

export const TrekkingPlacesList = ({ places, total }: TrekkingPlacesListProps) => {
  if (places.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron lugares de trekking.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Resultados encontrados: {total}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place) => (
          <TrekkingPlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
};
