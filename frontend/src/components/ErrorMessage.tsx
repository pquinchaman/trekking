import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="bg-red-500 rounded-full p-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-900 mb-2">Error al buscar</h3>
          <p className="text-red-700 leading-relaxed">{message}</p>
          <p className="text-sm text-red-600 mt-3">
            Por favor, verifica tus parámetros de búsqueda e intenta nuevamente.
          </p>
        </div>
      </div>
    </div>
  );
};
