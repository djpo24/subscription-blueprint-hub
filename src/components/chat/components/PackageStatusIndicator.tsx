
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PackageIndicator } from '@/components/chat/types/PackageStatusTypes';

interface PackageStatusIndicatorProps {
  packageIndicator: PackageIndicator;
  size?: 'sm' | 'md';
}

export function PackageStatusIndicator({ 
  packageIndicator, 
  size = 'sm' 
}: PackageStatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`
              ${sizeClasses[size]} 
              ${packageIndicator.color} 
              rounded-full 
              border-2 
              border-white 
              shadow-sm 
              cursor-help
              flex-shrink-0
            `}
            aria-label={packageIndicator.description}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-center">
            <div className="font-semibold text-sm">
              {packageIndicator.label}
            </div>
            <div className="text-xs opacity-90 mt-1">
              {packageIndicator.description}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
