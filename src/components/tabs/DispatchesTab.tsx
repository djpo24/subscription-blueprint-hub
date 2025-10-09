
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DispatchesTable } from '@/components/DispatchesTable';
import { DispatchDetailsView } from '@/components/dispatch-details/DispatchDetailsView';
import { AllPackagesTable } from '@/components/packages/AllPackagesTable';
import { useIsMobile } from '@/hooks/use-mobile';

export function DispatchesTab() {
  const [selectedDispatchId, setSelectedDispatchId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [activeSubTab, setActiveSubTab] = useState('dispatches');
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
    <div className={`space-y-4 ${isMobile ? 'px-2' : 'sm:space-y-8 px-2 sm:px-0'}`}>
      {viewMode === 'list' ? (
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dispatches">Despachos</TabsTrigger>
            <TabsTrigger value="packages">Encomiendas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dispatches" className="mt-4">
            <DispatchesTable onViewDispatch={handleViewDispatch} />
          </TabsContent>
          
          <TabsContent value="packages" className="mt-4">
            <AllPackagesTable />
          </TabsContent>
        </Tabs>
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
    </div>
  );
}
