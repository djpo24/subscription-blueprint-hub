
import { Card, CardContent } from '@/components/ui/card';
import { useDispatchRelations } from '@/hooks/useDispatchRelations';
import { useIsMobile } from '@/hooks/use-mobile';
import { DispatchesTableHeader } from './dispatches-table/DispatchesTableHeader';
import { DispatchesEmptyState } from './dispatches-table/DispatchesEmptyState';
import { DispatchesMobileView } from './dispatches-table/DispatchesMobileView';
import { DispatchesDesktopView } from './dispatches-table/DispatchesDesktopView';

interface DispatchesTableProps {
  selectedDate?: Date;
  onViewDispatch: (dispatchId: string) => void;
}

export function DispatchesTable({ selectedDate, onViewDispatch }: DispatchesTableProps) {
  const { data: dispatches = [], isLoading } = useDispatchRelations(selectedDate);
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500 text-sm">
            Cargando despachos...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <DispatchesTableHeader 
        selectedDate={selectedDate} 
        dispatchCount={dispatches.length}
        isMobile={isMobile}
      />
      <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
        {dispatches.length === 0 ? (
          <DispatchesEmptyState selectedDate={selectedDate} isMobile={isMobile} />
        ) : isMobile ? (
          <DispatchesMobileView dispatches={dispatches} onViewDispatch={onViewDispatch} />
        ) : (
          <DispatchesDesktopView dispatches={dispatches} onViewDispatch={onViewDispatch} />
        )}
      </CardContent>
    </Card>
  );
}
