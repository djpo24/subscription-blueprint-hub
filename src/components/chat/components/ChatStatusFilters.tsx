
import { Badge } from '@/components/ui/badge';
import { PACKAGE_STATUS_CONFIG, PackageStatus } from '@/components/chat/types/PackageStatusTypes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatStatusFiltersProps {
  selectedStatus: PackageStatus | null;
  onStatusSelect: (status: PackageStatus | null) => void;
  chatCounts: Record<PackageStatus, number>;
}

export function ChatStatusFilters({ selectedStatus, onStatusSelect, chatCounts }: ChatStatusFiltersProps) {
  // Orden de prioridad para mostrar los filtros
  const statusOrder: PackageStatus[] = [
    'pending_pickup_payment',
    'delivered_pending_payment', 
    'pending_delivery',
    'dispatched',
    'in_transit',
    'received_processed',
    'delivered'
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {statusOrder.map((status) => {
          const config = PACKAGE_STATUS_CONFIG[status];
          const count = chatCounts[status] || 0;
          const isSelected = selectedStatus === status;
          
          if (count === 0) return null;
          
          return (
            <Tooltip key={status}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onStatusSelect(isSelected ? null : status)}
                  className={`
                    relative cursor-pointer transition-all duration-200 hover:scale-110
                    ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                  `}
                >
                  <div 
                    className={`
                      w-4 h-4 rounded-full border-2 border-white shadow-sm
                      ${config.color}
                      ${isSelected ? 'scale-110' : ''}
                    `}
                  />
                  {count > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center min-w-[16px]"
                    >
                      {count}
                    </Badge>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="text-center">
                  <div className="font-semibold text-sm">
                    {config.label} ({count})
                  </div>
                  <div className="text-xs opacity-90 mt-1">
                    {config.description}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {/* Botón para limpiar filtro */}
        {selectedStatus && (
          <button
            onClick={() => onStatusSelect(null)}
            className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar
          </button>
        )}
      </div>
    </TooltipProvider>
  );
}
