import { useState } from 'react';
import { SearchForm } from '../components/SearchForm';
import { TrekkingPlacesList } from '../components/TrekkingPlacesList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useTrekkingPlaces } from '../hooks/useTrekkingPlaces';
import type { SearchTrekkingPlacesParams } from '../types';

export const HomePage = () => {
  const [searchParams, setSearchParams] = useState<SearchTrekkingPlacesParams | null>(null);
  
  const { data, isLoading, error } = useTrekkingPlaces(searchParams);

  const handleSearch = (params: SearchTrekkingPlacesParams) => {
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ minHeight: '100vh' }}>
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏔️ Trekking Chile
          </h1>
          <p className="text-gray-600">
            Descubre los mejores lugares para hacer trekking y senderismo en Chile
          </p>
        </header>

        <div className="mb-8">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {isLoading && <LoadingSpinner />}

        {error && (
          <div className="mb-8">
            <ErrorMessage
              message={
                error instanceof Error
                  ? error.message
                  : 'Ocurrió un error al buscar lugares de trekking. Por favor, intenta nuevamente.'
              }
            />
          </div>
        )}

        {data && !isLoading && !error && (
          <TrekkingPlacesList places={data.places} total={data.total} />
        )}

        {!data && !isLoading && !error && !searchParams && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-500 text-lg mb-4">
              Completa el formulario de búsqueda para encontrar lugares de trekking en Chile.
            </p>
            <p className="text-gray-400 text-sm">
              Puedes buscar por ubicación (latitud/longitud), nombre, dificultad y más.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
