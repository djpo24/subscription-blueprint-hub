import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useScannerConnection } from '@/hooks/useScannerConnection';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ScannerConnectionPanel } from './ScannerConnectionPanel';
import { ScannedPackagesList } from './ScannedPackagesList';
import { BultoSummary } from './BultoSummary';
import { Loader2 } from 'lucide-react';

interface CreateBultoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateBultoDialog({ open, onOpenChange, onSuccess }: CreateBultoDialogProps) {
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [scannedPackages, setScannedPackages] = useState<any[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [nextBultoNumber, setNextBultoNumber] = useState<number>(1);

  const { lastScan, startConnection, stopConnection, isConnected } = useScannerConnection(sessionId, 'desktop');

  const { data: trips } = useQuery({
    queryKey: ['trips-for-bulto'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .in('status', ['scheduled', 'pending'])
        .order('trip_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Get next bulto number when trip is selected
  useEffect(() => {
    if (selectedTripId) {
      supabase
        .from('bultos')
        .select('bulto_number')
        .eq('trip_id', selectedTripId)
        .order('bulto_number', { ascending: false })
        .limit(1)
        .then(({ data }) => {
          const maxNumber = data?.[0]?.bulto_number || 0;
          setNextBultoNumber(maxNumber + 1);
        });
    }
  }, [selectedTripId]);

  // Handle scanned barcode
  useEffect(() => {
    if (lastScan && selectedTripId) {
      handleScan(lastScan);
    }
  }, [lastScan, selectedTripId]);

  const handleScan = async (barcode: string) => {
    // Check if package exists
    const { data: pkg, error } = await supabase
      .from('packages')
      .select(`
        *,
        customers!packages_customer_id_fkey(name, email),
        bultos!packages_bulto_id_fkey(id, bulto_number)
      `)
      .eq('tracking_number', barcode)
      .single();

    if (error || !pkg) {
      toast.error('Paquete no encontrado', {
        description: `No se encontró paquete con código ${barcode}`
      });
      return;
    }

    // Check if already in current scan list
    const alreadyScanned = scannedPackages.some(p => p.id === pkg.id);
    if (alreadyScanned) {
      toast.info('Paquete ya escaneado en este bulto');
      return;
    }

    // Check if package is in another bulto
    if (pkg.bulto_id) {
      const bultoInfo = pkg.bultos ? `Bulto #${pkg.bultos.bulto_number}` : 'otro bulto';
      toast.warning('Paquete ya asignado', {
        description: `Este paquete ya está en ${bultoInfo}. ¿Deseas moverlo?`,
        action: {
          label: 'Mover',
          onClick: () => {
            setScannedPackages(prev => [...prev, { ...pkg, isMoving: true }]);
            toast.success('Paquete agregado para mover');
          }
        }
      });
      return;
    }

    setScannedPackages(prev => [...prev, pkg]);
    toast.success('Paquete agregado', {
      description: `${pkg.tracking_number} - ${pkg.customers?.name}`
    });
  };

  const handleRemovePackage = (packageId: string) => {
    setScannedPackages(prev => prev.filter(p => p.id !== packageId));
  };

  const handleCreateBulto = () => {
    if (scannedPackages.length === 0) {
      toast.error('Debes escanear al menos un paquete');
      return;
    }
    setShowSummary(true);
  };

  const createBultoMutation = useMutation({
    mutationFn: async () => {
      // Create bulto
      const { data: bulto, error: bultoError } = await supabase
        .from('bultos')
        .insert({
          trip_id: selectedTripId,
          bulto_number: nextBultoNumber,
          notes,
          total_packages: scannedPackages.length,
          status: 'open'
        })
        .select()
        .single();

      if (bultoError) throw bultoError;

      // Update packages
      const packageIds = scannedPackages.map(p => p.id);
      const { error: updateError } = await supabase
        .from('packages')
        .update({ bulto_id: bulto.id })
        .in('id', packageIds);

      if (updateError) throw updateError;

      return bulto;
    },
    onSuccess: () => {
      toast.success('Bulto creado exitosamente');
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      console.error('Error creating bulto:', error);
      toast.error('Error al crear bulto');
    }
  });

  const handleClose = () => {
    stopConnection();
    setScannedPackages([]);
    setSelectedTripId('');
    setNotes('');
    setShowSummary(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showSummary ? 'Confirmar Bulto' : 'Crear Nuevo Bulto'}
          </DialogTitle>
        </DialogHeader>

        {!showSummary ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Viaje</Label>
              <Select value={selectedTripId} onValueChange={setSelectedTripId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un viaje" />
                </SelectTrigger>
                <SelectContent>
                  {trips?.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.origin} → {trip.destination} - {new Date(trip.trip_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTripId && (
              <>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Número de bulto: #{nextBultoNumber}</p>
                </div>

                <ScannerConnectionPanel 
                  sessionId={sessionId}
                  isConnected={isConnected}
                  onConnect={startConnection}
                  onDisconnect={stopConnection}
                />

                <ScannedPackagesList 
                  packages={scannedPackages}
                  onRemove={handleRemovePackage}
                />

                <div className="space-y-2">
                  <Label>Notas (opcional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas adicionales sobre este bulto..."
                  />
                </div>

                <Button 
                  onClick={handleCreateBulto}
                  disabled={scannedPackages.length === 0}
                  className="w-full"
                >
                  Crear Bulto con {scannedPackages.length} Paquete(s)
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <BultoSummary 
              bultoNumber={nextBultoNumber}
              packages={scannedPackages}
              notes={notes}
            />

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowSummary(false)}
                className="flex-1"
              >
                Volver
              </Button>
              <Button 
                onClick={() => createBultoMutation.mutate()}
                disabled={createBultoMutation.isPending}
                className="flex-1"
              >
                {createBultoMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Confirmar y Crear Bulto
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
