
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { DispatchesTable } from '@/components/DispatchesTable';
import { DispatchDetailsView } from '@/components/dispatch-details/DispatchDetailsView';
import { useIsMobile } from '@/hooks/use-mobile';

export function DispatchesTab() {
  const [selectedDispatchId, setSelectedDispatchId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const isMobile = useIsMobile();

  const handleViewDispatch = (dispatchId: string) => {
    setSelectedDispatchId(dispatchId);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setSelectedDispatchId(null);
    setViewMode('list');
  };

  return (
    <TabsContent value="dispatches" className={`space-y-4 ${isMobile ? 'px-2' : 'sm:space-y-8 px-2 sm:px-0'}`}>
      {viewMode === 'list' ? (
        <DispatchesTable onViewDispatch={handleViewDispatch} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className={isMobile ? 'text-xs' : ''}>Volver a Despachos</span>
            </Button>
          </div>
          <DispatchDetailsView dispatchId={selectedDispatchId} />
        </div>
      )}
    </TabsContent>
  );
}
