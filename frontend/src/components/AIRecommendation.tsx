import { SparklesIcon } from '@heroicons/react/24/solid';

interface AIRecommendationProps {
  recommendation: string;
}

export const AIRecommendation = ({ recommendation }: AIRecommendationProps) => {
  return (
    <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-l-4 border-primary-500 rounded-xl p-6 mb-6 shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="bg-primary-500 rounded-full p-2">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span>Recomendación de IA</span>
          </h3>
          <p className="text-gray-700 leading-relaxed">{recommendation}</p>
        </div>
      </div>
    </div>
  );
};
