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
  preSelectedTripId?: string;
}

export function CreateBultoDialog({ open, onOpenChange, onSuccess, preSelectedTripId }: CreateBultoDialogProps) {
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [selectedTripId, setSelectedTripId] = useState<string>(preSelectedTripId || '');
  const [notes, setNotes] = useState('');
  const [scannedPackages, setScannedPackages] = useState<any[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [nextBultoNumber, setNextBultoNumber] = useState<number>(1);
  const [showBultoOptions, setShowBultoOptions] = useState(false);
  const [bultoQuantity, setBultoQuantity] = useState<number>(1);
  const [selectedExistingBultoId, setSelectedExistingBultoId] = useState<string>('');
  const [mode, setMode] = useState<'create' | 'select' | null>(null);

  const { lastScan, startConnection, stopConnection, isConnected } = useScannerConnection(sessionId, 'desktop');

  // Initialize selectedTripId from preSelectedTripId
  useEffect(() => {
    if (preSelectedTripId) {
      setSelectedTripId(preSelectedTripId);
    }
  }, [preSelectedTripId]);

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

  // Query existing bultos for the selected trip
  const { data: existingBultos } = useQuery({
    queryKey: ['existing-bultos', selectedTripId],
    queryFn: async () => {
      if (!selectedTripId) return [];
      const { data, error } = await supabase
        .from('bultos')
        .select('*')
        .eq('trip_id', selectedTripId)
        .eq('status', 'open')
        .order('bulto_number', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedTripId
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
    
    // Check if there are existing bultos
    const hasBultos = existingBultos && existingBultos.length > 0;
    
    if (hasBultos) {
      setShowBultoOptions(true);
    } else {
      setMode('create');
      setShowSummary(true);
    }
  };

  const createBultoMutation = useMutation({
    mutationFn: async () => {
      if (mode === 'select' && selectedExistingBultoId) {
        // Add packages to existing bulto
        const packageIds = scannedPackages.map(p => p.id);
        const { error: updateError } = await supabase
          .from('packages')
          .update({ bulto_id: selectedExistingBultoId })
          .in('id', packageIds);

        if (updateError) throw updateError;

        // Update bulto package count
        const { data: bulto } = await supabase
          .from('bultos')
          .select('total_packages')
          .eq('id', selectedExistingBultoId)
          .single();

        if (bulto) {
          await supabase
            .from('bultos')
            .update({ total_packages: bulto.total_packages + scannedPackages.length })
            .eq('id', selectedExistingBultoId);
        }

        return { id: selectedExistingBultoId };
      } else {
        // Create new bultos
        const bultosToCreate = [];
        for (let i = 0; i < bultoQuantity; i++) {
          bultosToCreate.push({
            trip_id: selectedTripId,
            bulto_number: nextBultoNumber + i,
            notes: i === 0 ? notes : '',
            total_packages: i === 0 ? scannedPackages.length : 0,
            status: 'open'
          });
        }

        const { data: bultos, error: bultoError } = await supabase
          .from('bultos')
          .insert(bultosToCreate)
          .select();

        if (bultoError) throw bultoError;

        // Update packages with first bulto
        if (scannedPackages.length > 0 && bultos[0]) {
          const packageIds = scannedPackages.map(p => p.id);
          const { error: updateError } = await supabase
            .from('packages')
            .update({ bulto_id: bultos[0].id })
            .in('id', packageIds);

          if (updateError) throw updateError;
        }

        return bultos[0];
      }
    },
    onSuccess: () => {
      if (mode === 'select') {
        toast.success('Paquetes agregados al bulto exitosamente');
      } else {
        toast.success(`${bultoQuantity} bulto(s) creado(s) exitosamente`);
      }
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      console.error('Error processing bulto:', error);
      toast.error('Error al procesar bulto');
    }
  });

  const handleClose = () => {
    stopConnection();
    setScannedPackages([]);
    setSelectedTripId('');
    setNotes('');
    setShowSummary(false);
    setShowBultoOptions(false);
    setBultoQuantity(1);
    setSelectedExistingBultoId('');
    setMode(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showSummary ? 'Confirmar Bulto' : showBultoOptions ? 'Opciones de Bulto' : 'Crear Nuevo Bulto'}
          </DialogTitle>
        </DialogHeader>

        {showBultoOptions ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿Qué deseas hacer con los {scannedPackages.length} paquete(s) escaneado(s)?
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setMode('create');
                  setShowBultoOptions(false);
                  setShowSummary(true);
                }}
                className="w-full"
                variant="default"
              >
                Crear Nuevo Bulto
              </Button>
              
              <Button
                onClick={() => {
                  setMode('select');
                  setShowBultoOptions(false);
                  setShowSummary(true);
                }}
                className="w-full"
                variant="outline"
              >
                Agregar a Bulto Existente
              </Button>
            </div>

            <Button
              onClick={() => setShowBultoOptions(false)}
              variant="ghost"
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        ) : !showSummary ? (
          <div className="space-y-6">
            {!preSelectedTripId && (
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
            )}

            {selectedTripId && (
              <>
                {!isConnected ? (
                  <ScannerConnectionPanel 
                    sessionId={sessionId}
                    isConnected={isConnected}
                    onConnect={startConnection}
                    onDisconnect={stopConnection}
                  />
                ) : (
                  <>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Número de bulto: #{nextBultoNumber}</p>
                    </div>

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
                      Continuar con {scannedPackages.length} Paquete(s)
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {mode === 'create' ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>¿Cuántos bultos deseas crear?</Label>
                    <input
                      type="number"
                      min="1"
                      value={bultoQuantity}
                      onChange={(e) => setBultoQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Se crearán {bultoQuantity} bulto(s). Los paquetes escaneados se asignarán al primer bulto.
                    </p>
                  </div>

                  <BultoSummary 
                    bultoNumber={nextBultoNumber}
                    packages={scannedPackages}
                    notes={notes}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowSummary(false);
                      setShowBultoOptions(true);
                    }}
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
                    Crear {bultoQuantity} Bulto(s)
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Selecciona el bulto</Label>
                    <Select value={selectedExistingBultoId} onValueChange={setSelectedExistingBultoId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un bulto" />
                      </SelectTrigger>
                      <SelectContent>
                        {existingBultos?.map((bulto) => (
                          <SelectItem key={bulto.id} value={bulto.id}>
                            Bulto #{bulto.bulto_number} ({bulto.total_packages} paquetes)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <BultoSummary 
                    bultoNumber={existingBultos?.find(b => b.id === selectedExistingBultoId)?.bulto_number || 0}
                    packages={scannedPackages}
                    notes=""
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowSummary(false);
                      setShowBultoOptions(true);
                    }}
                    className="flex-1"
                  >
                    Volver
                  </Button>
                  <Button 
                    onClick={() => createBultoMutation.mutate()}
                    disabled={createBultoMutation.isPending || !selectedExistingBultoId}
                    className="flex-1"
                  >
                    {createBultoMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Agregar a Bulto
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
