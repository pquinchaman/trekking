import type { TrekkingPlace } from '../types';
import { 
  MapPinIcon, 
  ClockIcon, 
  ChartBarIcon,
  ArrowTopRightOnSquareIcon,
  MapIcon
} from '@heroicons/react/24/outline';

interface TrekkingPlaceCardProps {
  place: TrekkingPlace;
}

export const TrekkingPlaceCard = ({ place }: TrekkingPlaceCardProps) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'Fácil';
      case 'moderate':
        return 'Moderada';
      case 'hard':
        return 'Difícil';
      case 'expert':
        return 'Experto';
      default:
        return difficulty || 'No especificada';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapIcon className="h-5 w-5 text-primary-600" />
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                {place.name}
              </h3>
            </div>
            {place.type && (
              <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md">
                {place.type}
              </span>
            )}
          </div>
          {place.difficulty && (
            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getDifficultyColor(place.difficulty)} whitespace-nowrap`}>
              {getDifficultyLabel(place.difficulty)}
            </span>
          )}
        </div>

        {place.description && (
          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {place.description}
          </p>
        )}

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <MapPinIcon className="h-5 w-5 mr-3 text-primary-500 flex-shrink-0" />
            <span className="font-medium">Ubicación:</span>
            <span className="ml-2 text-gray-600">
              {place.coordinates.lat.toFixed(4)}, {place.coordinates.lon.toFixed(4)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {place.distance && (
              <div className="flex items-center text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                <ChartBarIcon className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold">{place.distance} km</div>
                  <div className="text-xs text-gray-500">Distancia</div>
                </div>
              </div>
            )}

            {place.duration && (
              <div className="flex items-center text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                <ClockIcon className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold">{place.duration} h</div>
                  <div className="text-xs text-gray-500">Duración</div>
                </div>
              </div>
            )}
          </div>

          {place.elevation && (
            <div className="flex items-center text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
              <ChartBarIcon className="h-5 w-5 mr-2 text-primary-500 flex-shrink-0" />
              <div>
                <div className="font-semibold">{place.elevation} m</div>
                <div className="text-xs text-gray-500">Elevación</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Fuente: {place.source}
          </span>
          {place.osmUrl && (
            <a
              href={place.osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-semibold transition-colors"
            >
              Ver en mapa
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
