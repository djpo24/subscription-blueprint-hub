
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import type { ResponseFeedbackProps } from '../types/AIResponseTypes';

export function ResponseFeedback({
  interactionId,
  feedbackGiven,
  isSubmittingFeedback,
  onFeedback
}: ResponseFeedbackProps) {
  if (!interactionId) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      <span>¿Útil?</span>
      <Button
        onClick={() => onFeedback('positive')}
        disabled={isSubmittingFeedback || feedbackGiven === 'positive'}
        variant="ghost"
        size="sm"
        className={`h-6 w-6 p-0 ${
          feedbackGiven === 'positive' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
        }`}
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        onClick={() => onFeedback('negative')}
        disabled={isSubmittingFeedback || feedbackGiven === 'negative'}
        variant="ghost"
        size="sm"
        className={`h-6 w-6 p-0 ${
          feedbackGiven === 'negative' ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
        }`}
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
    </div>
  );
}
