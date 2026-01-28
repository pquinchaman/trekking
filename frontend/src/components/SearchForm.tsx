import { useState } from 'react';
import type { FormEvent } from 'react';
import { MagnifyingGlassIcon, SparklesIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { DifficultyLevel } from '../types';
import type { SearchTrekkingPlacesParams } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchTrekkingPlacesParams) => void;
  isLoading?: boolean;
}

export const SearchForm = ({ onSearch, isLoading = false }: SearchFormProps) => {
  const [searchMode, setSearchMode] = useState<'smart' | 'advanced'>('smart');
  const [smartQuery, setSmartQuery] = useState('');
  const [formData, setFormData] = useState<SearchTrekkingPlacesParams>({
    lat: undefined,
    lon: undefined,
    radius: 50,
    difficulty: undefined,
    name: '',
    limit: 20,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (searchMode === 'smart' && smartQuery.trim()) {
      // Modo búsqueda inteligente
      onSearch({ query: smartQuery.trim(), limit: formData.limit || 20 });
      return;
    }

    // Modo búsqueda avanzada
    const cleanParams: SearchTrekkingPlacesParams = {};
    if (formData.lat !== undefined) cleanParams.lat = formData.lat;
    if (formData.lon !== undefined) cleanParams.lon = formData.lon;
    if (formData.radius) cleanParams.radius = formData.radius;
    if (formData.difficulty) cleanParams.difficulty = formData.difficulty;
    if (formData.name?.trim()) cleanParams.name = formData.name.trim();
    if (formData.limit) cleanParams.limit = formData.limit;
    
    onSearch(cleanParams);
  };

  const handleInputChange = (field: keyof SearchTrekkingPlacesParams, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🏔️ Buscar Lugares de Trekking
        </h2>
        <p className="text-gray-600">
          Descubre los mejores senderos y rutas de trekking en Chile
        </p>
      </div>

      {/* Selector de modo de búsqueda */}
      <div className="mb-6 flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setSearchMode('smart')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            searchMode === 'smart'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <SparklesIcon className="h-5 w-5 inline-block mr-2" />
          Búsqueda Inteligente
        </button>
        <button
          type="button"
          onClick={() => setSearchMode('advanced')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            searchMode === 'advanced'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPinIcon className="h-5 w-5 inline-block mr-2" />
          Búsqueda Avanzada
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {searchMode === 'smart' ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="smartQuery" className="block text-sm font-semibold text-gray-700 mb-2">
                Describe lo que buscas
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="smartQuery"
                  value={smartQuery}
                  onChange={(e) => setSmartQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Ej: lugares fáciles cerca de Santiago con sombra"
                />
                <SparklesIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                💡 Usa lenguaje natural para buscar. Ej: "senderos moderados en Valparaíso" o "rutas difíciles cerca de la cordillera"
              </p>
            </div>

            <div>
              <label htmlFor="limit-smart" className="block text-sm font-semibold text-gray-700 mb-2">
                Límite de resultados
              </label>
              <input
                type="number"
                id="limit-smart"
                min="1"
                max="100"
                value={formData.limit ?? 20}
                onChange={(e) => handleInputChange('limit', parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lat" className="block text-sm font-semibold text-gray-700 mb-2">
                Latitud
              </label>
              <input
                type="number"
                id="lat"
                step="any"
                value={formData.lat ?? ''}
                onChange={(e) => handleInputChange('lat', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Ej: -33.4489"
              />
            </div>

            <div>
              <label htmlFor="lon" className="block text-sm font-semibold text-gray-700 mb-2">
                Longitud
              </label>
              <input
                type="number"
                id="lon"
                step="any"
                value={formData.lon ?? ''}
                onChange={(e) => handleInputChange('lon', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Ej: -70.6693"
              />
            </div>

            <div>
              <label htmlFor="radius" className="block text-sm font-semibold text-gray-700 mb-2">
                Radio (km)
              </label>
              <input
                type="number"
                id="radius"
                min="1"
                max="500"
                value={formData.radius ?? 50}
                onChange={(e) => handleInputChange('radius', parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-700 mb-2">
                Dificultad
              </label>
              <select
                id="difficulty"
                value={formData.difficulty ?? ''}
                onChange={(e) => handleInputChange('difficulty', e.target.value || undefined)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
              >
                <option value="">Todas</option>
                <option value={DifficultyLevel.EASY}>Fácil</option>
                <option value={DifficultyLevel.MODERATE}>Moderada</option>
                <option value={DifficultyLevel.HARD}>Difícil</option>
                <option value={DifficultyLevel.EXPERT}>Experto</option>
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del lugar
              </label>
              <input
                type="text"
                id="name"
                value={formData.name ?? ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Ej: Torres del Paine"
              />
            </div>

            <div>
              <label htmlFor="limit" className="block text-sm font-semibold text-gray-700 mb-2">
                Límite de resultados
              </label>
              <input
                type="number"
                id="limit"
                min="1"
                max="100"
                value={formData.limit ?? 20}
                onChange={(e) => handleInputChange('limit', parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (searchMode === 'smart' && !smartQuery.trim())}
          className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Buscando...
            </>
          ) : (
            <>
              <MagnifyingGlassIcon className="h-6 w-6" />
              Buscar Lugares
            </>
          )}
        </button>
      </form>
    </div>
  );
};
