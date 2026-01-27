import type { TrekkingPlace } from '../types';
import { MapPinIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface TrekkingPlaceCardProps {
  place: TrekkingPlace;
}

export const TrekkingPlaceCard = ({ place }: TrekkingPlaceCardProps) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-800">{place.name}</h3>
        {place.difficulty && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(place.difficulty)}`}>
            {place.difficulty}
          </span>
        )}
      </div>

      {place.description && (
        <p className="text-gray-600 mb-4">{place.description}</p>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPinIcon className="h-5 w-5 mr-2 text-primary-600" />
          <span>
            {place.coordinates.lat.toFixed(4)}, {place.coordinates.lon.toFixed(4)}
          </span>
        </div>

        {place.distance && (
          <div className="flex items-center text-sm text-gray-600">
            <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
            <span>Distancia: {place.distance} km</span>
          </div>
        )}

        {place.duration && (
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-5 w-5 mr-2 text-primary-600" />
            <span>Duración: {place.duration} horas</span>
          </div>
        )}

        {place.elevation && (
          <div className="flex items-center text-sm text-gray-600">
            <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
            <span>Elevación: {place.elevation} m</span>
          </div>
        )}
      </div>

      {place.osmUrl && (
        <a
          href={place.osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Ver en OpenStreetMap →
        </a>
      )}
    </div>
  );
};
