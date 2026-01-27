import { useState } from 'react';
import type { FormEvent } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { DifficultyLevel } from '../types';
import type { SearchTrekkingPlacesParams } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchTrekkingPlacesParams) => void;
  isLoading?: boolean;
}

export const SearchForm = ({ onSearch, isLoading = false }: SearchFormProps) => {
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
    // Limpiar valores vacíos antes de enviar
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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Buscar Lugares de Trekking</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1">
            Latitud
          </label>
          <input
            type="number"
            id="lat"
            step="any"
            value={formData.lat ?? ''}
            onChange={(e) => handleInputChange('lat', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ej: -33.4489"
          />
        </div>

        <div>
          <label htmlFor="lon" className="block text-sm font-medium text-gray-700 mb-1">
            Longitud
          </label>
          <input
            type="number"
            id="lon"
            step="any"
            value={formData.lon ?? ''}
            onChange={(e) => handleInputChange('lon', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ej: -70.6693"
          />
        </div>

        <div>
          <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
            Radio (km)
          </label>
          <input
            type="number"
            id="radius"
            min="1"
            max="500"
            value={formData.radius ?? 50}
            onChange={(e) => handleInputChange('radius', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
            Dificultad
          </label>
          <select
            id="difficulty"
            value={formData.difficulty ?? ''}
            onChange={(e) => handleInputChange('difficulty', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todas</option>
            <option value={DifficultyLevel.EASY}>Fácil</option>
            <option value={DifficultyLevel.MODERATE}>Moderada</option>
            <option value={DifficultyLevel.HARD}>Difícil</option>
            <option value={DifficultyLevel.EXPERT}>Experto</option>
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del lugar
          </label>
          <input
            type="text"
            id="name"
            value={formData.name ?? ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ej: Torres del Paine"
          />
        </div>

        <div>
          <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
            Límite de resultados
          </label>
          <input
            type="number"
            id="limit"
            min="1"
            max="100"
            value={formData.limit ?? 20}
            onChange={(e) => handleInputChange('limit', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full md:w-auto px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Buscando...
          </>
        ) : (
          <>
            <MagnifyingGlassIcon className="h-5 w-5" />
            Buscar
          </>
        )}
      </button>
    </form>
  );
};
