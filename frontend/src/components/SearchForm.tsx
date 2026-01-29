import { useState } from 'react';
import type { FormEvent } from 'react';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon, 
  MapPinIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { DifficultyLevel } from '../types';
import type { SearchTrekkingPlacesParams } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchTrekkingPlacesParams) => void;
  isLoading?: boolean;
}

interface ValidationErrors {
  lat?: string;
  lon?: string;
  radius?: string;
  limit?: string;
}

// Ejemplos rápidos para búsqueda inteligente
const QUICK_EXAMPLES = [
  'lugares fáciles cerca de Santiago con sombra',
  'senderos moderados en Valparaíso',
  'rutas difíciles cerca de la cordillera',
  'trekking cerca del mar en Los Lagos',
  'senderos familiares con vistas panorámicas',
];

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
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Validar coordenadas
  const validateCoordinates = (lat?: number, lon?: number): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    if (lat !== undefined) {
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.lat = 'La latitud debe estar entre -90 y 90';
      }
    }
    
    if (lon !== undefined) {
      if (isNaN(lon) || lon < -180 || lon > 180) {
        newErrors.lon = 'La longitud debe estar entre -180 y 180';
      }
    }
    
    return newErrors;
  };

  // Validar otros campos
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Validar coordenadas
    const coordErrors = validateCoordinates(formData.lat, formData.lon);
    Object.assign(newErrors, coordErrors);
    
    // Validar radio
    if (formData.radius !== undefined) {
      if (formData.radius < 1 || formData.radius > 500) {
        newErrors.radius = 'El radio debe estar entre 1 y 500 km';
      }
    }
    
    // Validar límite
    if (formData.limit !== undefined) {
      if (formData.limit < 1 || formData.limit > 100) {
        newErrors.limit = 'El límite debe estar entre 1 y 100';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (searchMode === 'smart' && smartQuery.trim()) {
      // Modo búsqueda inteligente
      onSearch({ query: smartQuery.trim(), limit: formData.limit || 20 });
      return;
    }

    // Validar formulario en modo avanzado
    if (!validateForm()) {
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
    
    // Limpiar error del campo cuando se modifica
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof ValidationErrors];
        return newErrors;
      });
    }
    
    // Validar coordenadas en tiempo real
    if (field === 'lat' || field === 'lon') {
      const lat = field === 'lat' ? (value === '' ? undefined : parseFloat(value)) : formData.lat;
      const lon = field === 'lon' ? (value === '' ? undefined : parseFloat(value)) : formData.lon;
      const coordErrors = validateCoordinates(lat, lon);
      setErrors((prev) => ({ ...prev, ...coordErrors }));
    }
  };

  // Limpiar formulario
  const handleClear = () => {
    setSmartQuery('');
    setFormData({
      lat: undefined,
      lon: undefined,
      radius: 50,
      difficulty: undefined,
      name: '',
      limit: 20,
    });
    setErrors({});
  };

  // Usar ejemplo rápido
  const handleQuickExample = (example: string) => {
    setSmartQuery(example);
  };

  // Obtener ubicación del usuario
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está disponible en tu navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          lat: parseFloat(position.coords.latitude.toFixed(4)),
          lon: parseFloat(position.coords.longitude.toFixed(4)),
        }));
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.lat;
          delete newErrors.lon;
          return newErrors;
        });
      },
      (error) => {
        alert('No se pudo obtener tu ubicación. Por favor, ingresa las coordenadas manualmente.');
        console.error('Error de geolocalización:', error);
      }
    );
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
                Describe lo que buscas <span className="text-red-500">*</span>
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
              
              {/* Ejemplos rápidos */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Ejemplos rápidos:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_EXAMPLES.map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleQuickExample(example)}
                      className="px-3 py-1.5 text-xs bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors border border-primary-200"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="limit-smart" className="block text-sm font-semibold text-gray-700 mb-2">
                Límite de resultados
                <span className="ml-2 relative group">
                  <InformationCircleIcon className="h-4 w-4 inline text-gray-400 cursor-help" />
                  <span className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Número máximo de resultados a mostrar (1-100)
                  </span>
                </span>
              </label>
              <input
                type="number"
                id="limit-smart"
                min="1"
                max="100"
                value={formData.limit ?? 20}
                onChange={(e) => handleInputChange('limit', parseInt(e.target.value))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  errors.limit ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.limit && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XMarkIcon className="h-4 w-4" />
                  {errors.limit}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Botón para obtener ubicación */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGetLocation}
                className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors border border-primary-200"
              >
                <MapPinIcon className="h-4 w-4" />
                Usar mi ubicación
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lat" className="block text-sm font-semibold text-gray-700 mb-2">
                  Latitud
                  <span className="ml-2 relative group">
                    <InformationCircleIcon className="h-4 w-4 inline text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Coordenada de latitud (-90 a 90). Ejemplo: -33.4489 para Santiago
                    </span>
                  </span>
                </label>
                <input
                  type="number"
                  id="lat"
                  step="any"
                  value={formData.lat ?? ''}
                  onChange={(e) => handleInputChange('lat', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.lat ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Ej: -33.4489"
                />
                {errors.lat && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <XMarkIcon className="h-4 w-4" />
                    {errors.lat}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lon" className="block text-sm font-semibold text-gray-700 mb-2">
                  Longitud
                  <span className="ml-2 relative group">
                    <InformationCircleIcon className="h-4 w-4 inline text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Coordenada de longitud (-180 a 180). Ejemplo: -70.6693 para Santiago
                    </span>
                  </span>
                </label>
                <input
                  type="number"
                  id="lon"
                  step="any"
                  value={formData.lon ?? ''}
                  onChange={(e) => handleInputChange('lon', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.lon ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Ej: -70.6693"
                />
                {errors.lon && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <XMarkIcon className="h-4 w-4" />
                    {errors.lon}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="radius" className="block text-sm font-semibold text-gray-700 mb-2">
                  Radio (km)
                  <span className="ml-2 relative group">
                    <InformationCircleIcon className="h-4 w-4 inline text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Distancia en kilómetros desde el punto de coordenadas (1-500 km)
                    </span>
                  </span>
                </label>
                <input
                  type="number"
                  id="radius"
                  min="1"
                  max="500"
                  value={formData.radius ?? 50}
                  onChange={(e) => handleInputChange('radius', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.radius ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.radius && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <XMarkIcon className="h-4 w-4" />
                    {errors.radius}
                  </p>
                )}
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
                  <span className="ml-2 relative group">
                    <InformationCircleIcon className="h-4 w-4 inline text-gray-400 cursor-help" />
                    <span className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Número máximo de resultados a mostrar (1-100)
                    </span>
                  </span>
                </label>
                <input
                  type="number"
                  id="limit"
                  min="1"
                  max="100"
                  value={formData.limit ?? 20}
                  onChange={(e) => handleInputChange('limit', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.limit ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.limit && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <XMarkIcon className="h-4 w-4" />
                    {errors.limit}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2 font-semibold text-lg transition-all"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Limpiar
          </button>
          <button
            type="submit"
            disabled={isLoading || (searchMode === 'smart' && !smartQuery.trim()) || Object.keys(errors).length > 0}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
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
        </div>
      </form>
    </div>
  );
};
