import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Box, Plus, Scan } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { CreateBultoDialog } from '../bultos/CreateBultoDialog';
import { ScanToBultoDialog } from '../bultos/ScanToBultoDialog';
import { BultoDetailsDialog } from './BultoDetailsDialog';

interface TripBultosViewProps {
  tripId: string;
  tripDate: Date;
  origin: string;
  destination: string;
}

export function TripBultosView({ tripId, tripDate, origin, destination }: TripBultosViewProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [selectedBultoForScan, setSelectedBultoForScan] = useState<string | null>(null);
  const [selectedBulto, setSelectedBulto] = useState<any>(null);

  const { data: bultos, refetch } = useQuery({
    queryKey: ['trip-bultos', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bultos')
        .select(`
          *,
          packages:packages!packages_bulto_id_fkey(count)
        `)
        .eq('trip_id', tripId)
        .order('bulto_number', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const { data: unassignedCount } = useQuery({
    queryKey: ['unassigned-packages', tripId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('packages')
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', tripId)
        .is('bulto_id', null);

      if (error) throw error;
      return count || 0;
    }
  });

  return (
    <div className="space-y-4">
      {unassignedCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-700">
              <Package className="h-5 w-5" />
              <p className="text-sm font-medium">
                Hay {unassignedCount} paquete(s) sin asignar a bultos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {bultos && bultos.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Bultos - {origin} → {destination}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowCreateDialog(true)} 
                    size="sm"
                    variant="default"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Bultos
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bultos.map((bulto) => (
            <Card 
              key={bulto.id} 
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedBulto(bulto)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Bulto #{bulto.bulto_number}</CardTitle>
                  <Badge variant={bulto.status === 'open' ? 'default' : 'secondary'}>
                    {bulto.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{bulto.total_packages} paquetes</span>
                </div>

                {bulto.notes && (
                  <p className="text-sm text-muted-foreground italic line-clamp-2">
                    {bulto.notes}
                  </p>
                )}

                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBultoForScan(bulto.id);
                    setShowScanDialog(true);
                  }}
                >
                  <Scan className="h-4 w-4 mr-2" />
                  Escanear
                </Button>
              </CardContent>
            </Card>
          ))}
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                Bultos - {origin} → {destination}
              </CardTitle>
              <Button 
                onClick={() => setShowCreateDialog(true)} 
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Bultos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-12 pb-12">
            <div className="text-center text-muted-foreground">
              <Box className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay bultos creados</p>
              <p className="text-sm mt-2">
                Crea bultos para organizar las encomiendas de este viaje
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <CreateBultoDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refetch}
        preSelectedTripId={tripId}
      />

      <ScanToBultoDialog
        open={showScanDialog}
        onOpenChange={(open) => {
          setShowScanDialog(open);
          if (!open) setSelectedBultoForScan(null);
        }}
        onSuccess={refetch}
        tripId={tripId}
        preSelectedBultoId={selectedBultoForScan || undefined}
      />

      {selectedBulto && (
        <BultoDetailsDialog
          open={!!selectedBulto}
          onOpenChange={(open) => !open && setSelectedBulto(null)}
          bulto={selectedBulto}
          onUpdate={refetch}
        />
      )}
    </div>
  );
}
