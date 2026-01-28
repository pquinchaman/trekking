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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12" style={{ maxWidth: '1400px' }}>
        <header className="mb-10 text-center">
          <div className="inline-block mb-4">
            <span className="text-6xl">🏔️</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
            Trekking Chile
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre los mejores lugares para hacer trekking y senderismo en Chile
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Explora senderos, rutas y aventuras en la naturaleza chilena
          </p>
        </header>

        <div className="mb-10">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {isLoading && (
          <div className="mb-8">
            <LoadingSpinner />
          </div>
        )}

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
          <TrekkingPlacesList 
            places={data.places} 
            total={data.total}
            aiRecommendation={data.aiRecommendation}
          />
        )}

        {!data && !isLoading && !error && !searchParams && (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="max-w-2xl mx-auto px-6">
              <div className="text-7xl mb-6">🗺️</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comienza tu aventura
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Usa la <span className="font-semibold text-primary-600">búsqueda inteligente</span> para encontrar lugares con lenguaje natural,
                o la <span className="font-semibold text-primary-600">búsqueda avanzada</span> para filtros específicos.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-left mt-8">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="text-2xl mb-2">✨</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Búsqueda Inteligente</h3>
                  <p className="text-sm text-gray-600">
                    Describe lo que buscas en lenguaje natural y encuentra lugares perfectos para ti.
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Búsqueda Avanzada</h3>
                  <p className="text-sm text-gray-600">
                    Filtra por ubicación, dificultad, nombre y más parámetros específicos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
