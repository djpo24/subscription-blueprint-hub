import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ScannerConnectionPanel } from './ScannerConnectionPanel';
import { ScannedPackagesList } from './ScannedPackagesList';
import { Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

interface ScanToBultoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  tripId: string;
  preSelectedBultoId?: string;
}

export function ScanToBultoDialog({ open, onOpenChange, onSuccess, tripId, preSelectedBultoId }: ScanToBultoDialogProps) {
  const queryClient = useQueryClient();
  
  const [scanSessionId] = useState(() => `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isMobileConnected, setIsMobileConnected] = useState(false);
  const [selectedBultoId, setSelectedBultoId] = useState<string>('');
  const [scannedPackages, setScannedPackages] = useState<any[]>([]);

  // Generate QR code and setup Realtime when dialog opens
  useEffect(() => {
    if (!open) return;

    const setupScanner = async () => {
      try {
        // Generate QR code
        const url = `${window.location.origin}${window.location.pathname}#/mobile-scanner?session=${scanSessionId}`;
        const qr = await QRCode.toDataURL(url, { width: 300 });
        setQrCodeUrl(qr);

        // Setup Realtime channel
        const channel = supabase
          .channel(`scan_session_${scanSessionId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'scan_sessions',
              filter: `session_id=eq.${scanSessionId}`
            },
            async (payload) => {
              const barcode = payload.new.barcode;
              
              console.log('[ScanToBulto] 📦 Received scan:', barcode);
              
              // Detectar handshake de conexión
              if (barcode === '__connected__') {
                setIsMobileConnected(true);
                toast.success('📱 Celular conectado');
                return;
              }
              
              // Filtrar URLs (QR codes)
              if (barcode.startsWith('http://') || barcode.startsWith('https://')) {
                console.log('[ScanToBulto] ⚠️ Ignoring URL scan');
                return;
              }
              
              // Buscar y agregar paquete
              if (selectedBultoId) {
                await handleScan(barcode);
                
                // Marcar como procesado
                await supabase
                  .from('scan_sessions')
                  .update({ processed: true })
                  .eq('id', payload.new.id);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error setting up scanner:', error);
        toast.error('Error al configurar escáner');
      }
    };

    setupScanner();
  }, [open, scanSessionId, selectedBultoId]);

  // Query open bultos for the selected trip
  const { data: openBultos } = useQuery({
    queryKey: ['open-bultos', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bultos')
        .select('*')
        .eq('trip_id', tripId)
        .eq('status', 'open')
        .order('bulto_number', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tripId && open
  });

  // Auto-select bulto: prioritize preSelectedBultoId, otherwise first bulto
  useEffect(() => {
    if (openBultos && openBultos.length > 0 && !selectedBultoId) {
      if (preSelectedBultoId && openBultos.some(b => b.id === preSelectedBultoId)) {
        setSelectedBultoId(preSelectedBultoId);
      } else {
        setSelectedBultoId(openBultos[0].id);
      }
    }
  }, [openBultos, selectedBultoId, preSelectedBultoId]);

  const handleScan = async (barcode: string) => {
    console.log('[ScanToBulto] Processing scan:', barcode);
    
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
      toast.info('Paquete ya escaneado');
      return;
    }

    // Check if package is in another bulto
    if (pkg.bulto_id && pkg.bulto_id !== selectedBultoId) {
      const bultoInfo = pkg.bultos ? `Bulto #${pkg.bultos.bulto_number}` : 'otro bulto';
      toast.warning('Paquete en otro bulto', {
        description: `Este paquete está en ${bultoInfo}. Se moverá al bulto seleccionado.`
      });
    }

    setScannedPackages(prev => [...prev, pkg]);
    toast.success('Paquete agregado', {
      description: `${pkg.tracking_number} - ${pkg.customers?.name}`
    });
  };

  const handleRemovePackage = (packageId: string) => {
    setScannedPackages(prev => prev.filter(p => p.id !== packageId));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (scannedPackages.length === 0) {
        throw new Error('No hay paquetes para guardar');
      }

      const packageIds = scannedPackages.map(p => p.id);
      
      // Update packages with selected bulto
      const { error: updateError } = await supabase
        .from('packages')
        .update({ bulto_id: selectedBultoId })
        .in('id', packageIds);

      if (updateError) throw updateError;

      // Update bulto package count
      const { data: bulto } = await supabase
        .from('bultos')
        .select('total_packages')
        .eq('id', selectedBultoId)
        .single();

      if (bulto) {
        await supabase
          .from('bultos')
          .update({ total_packages: bulto.total_packages + scannedPackages.length })
          .eq('id', selectedBultoId);
      }
    },
    onSuccess: () => {
      toast.success(`${scannedPackages.length} paquete(s) agregados exitosamente`);
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['open-bultos'] });
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      console.error('Error saving packages:', error);
      toast.error('Error al guardar paquetes');
    }
  });

  const handleClose = () => {
    setScannedPackages([]);
    setSelectedBultoId('');
    setIsMobileConnected(false);
    setQrCodeUrl('');
    onOpenChange(false);
  };

  const selectedBulto = openBultos?.find(b => b.id === selectedBultoId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escanear Paquetes a Bulto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <ScannerConnectionPanel 
            qrCodeUrl={qrCodeUrl}
            isMobileConnected={isMobileConnected}
          />

          <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Selecciona el Bulto
                  </label>
                  <Select value={selectedBultoId} onValueChange={setSelectedBultoId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un bulto" />
                    </SelectTrigger>
                    <SelectContent>
                      {openBultos?.map((bulto) => (
                        <SelectItem key={bulto.id} value={bulto.id}>
                          Bulto #{bulto.bulto_number} ({bulto.total_packages} paquetes)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBulto && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">
                      Escaneando para Bulto #{selectedBulto.bulto_number}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {scannedPackages.length} paquete(s) escaneados
                    </p>
                  </div>
                )}
              </div>

          <ScannedPackagesList 
            packages={scannedPackages}
            onRemove={handleRemovePackage}
          />

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || scannedPackages.length === 0}
              className="flex-1"
            >
              {saveMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Guardar {scannedPackages.length} Paquete(s)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
