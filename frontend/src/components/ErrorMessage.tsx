import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
      <div>
        <h3 className="text-red-800 font-semibold mb-1">Error</h3>
        <p className="text-red-700">{message}</p>
      </div>
    </div>
  );
};
