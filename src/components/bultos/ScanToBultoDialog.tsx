import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ScannerConnectionPanel } from './ScannerConnectionPanel';
import { ScannedPackagesList } from './ScannedPackagesList';
import { PackageConflictDialog } from './PackageConflictDialog';
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
  const [conflictPackage, setConflictPackage] = useState<any>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  // Generate QR code and setup Realtime when dialog opens
  useEffect(() => {
    if (!open) return;

    let channel: any = null;

    const setupScanner = async () => {
      try {
        console.log('[ScanToBulto] 🚀 Setting up scanner with session:', scanSessionId);
        
        // Generate QR code
        const url = `${window.location.origin}${window.location.pathname}#/mobile-scanner?session=${scanSessionId}`;
        console.log('[ScanToBulto] 📱 QR URL:', url);
        const qr = await QRCode.toDataURL(url, { width: 300 });
        setQrCodeUrl(qr);

        // Setup Realtime channel
        channel = supabase
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
              console.log('[ScanToBulto] 📋 Current selectedBultoId:', selectedBultoId);
              console.log('[ScanToBulto] 📋 Payload:', payload);
              
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
                console.log('[ScanToBulto] ✅ Processing barcode:', barcode);
                await handleScan(barcode);
                
                // Marcar como procesado
                await supabase
                  .from('scan_sessions')
                  .update({ processed: true })
                  .eq('id', payload.new.id);
              } else {
                console.log('[ScanToBulto] ⚠️ No bulto selected, skipping scan');
              }
            }
          )
          .subscribe((status) => {
            console.log('[ScanToBulto] 📡 Channel status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('[ScanToBulto] ✅ Successfully subscribed to Realtime');
            }
          });

        console.log('[ScanToBulto] 📡 Channel created and subscribing...');
      } catch (error) {
        console.error('[ScanToBulto] ❌ Error setting up scanner:', error);
        toast.error('Error al configurar escáner');
      }
    };

    setupScanner();

    return () => {
      console.log('[ScanToBulto] 🧹 Cleaning up Realtime channel');
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
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

    // Check if package is in another bulto - show conflict dialog
    if (pkg.bulto_id && pkg.bulto_id !== selectedBultoId) {
      setConflictPackage(pkg);
      setShowConflictDialog(true);
      return;
    }

    // Add package normally
    addPackageToList(pkg);
  };

  const addPackageToList = (pkg: any) => {
    setScannedPackages(prev => [...prev, pkg]);
    toast.success('Paquete agregado', {
      description: `${pkg.tracking_number} - ${pkg.customers?.name}`
    });
  };

  const handleMovePackage = async () => {
    if (!conflictPackage) return;

    // Get old bulto for count update
    const oldBultoId = conflictPackage.bulto_id;

    // Update package to new bulto
    const { error: updateError } = await supabase
      .from('packages')
      .update({ bulto_id: selectedBultoId })
      .eq('id', conflictPackage.id);

    if (updateError) {
      toast.error('Error al trasladar paquete');
      setShowConflictDialog(false);
      setConflictPackage(null);
      return;
    }

    // Update old bulto count (decrease)
    if (oldBultoId) {
      const { data: oldBulto } = await supabase
        .from('bultos')
        .select('total_packages')
        .eq('id', oldBultoId)
        .single();

      if (oldBulto && oldBulto.total_packages > 0) {
        await supabase
          .from('bultos')
          .update({ total_packages: oldBulto.total_packages - 1 })
          .eq('id', oldBultoId);
      }
    }

    // Add to current list with updated bulto_id
    addPackageToList({ ...conflictPackage, bulto_id: selectedBultoId });
    
    toast.success('Paquete trasladado', {
      description: `El paquete se movió al bulto actual`
    });

    setShowConflictDialog(false);
    setConflictPackage(null);
  };

  const handleAddAdditionalPackage = async () => {
    if (!conflictPackage) return;

    // Increment label_count for the package
    const newLabelCount = (conflictPackage.label_count || 1) + 1;
    
    const { error: updateError } = await supabase
      .from('packages')
      .update({ label_count: newLabelCount })
      .eq('id', conflictPackage.id);

    if (updateError) {
      toast.error('Error al agregar paquete adicional');
      setShowConflictDialog(false);
      setConflictPackage(null);
      return;
    }

    // Create a new label entry for this package in the current bulto IMMEDIATELY
    const { error: labelError } = await supabase
      .from('package_labels')
      .insert({
        package_id: conflictPackage.id,
        bulto_id: selectedBultoId,
        label_number: newLabelCount,
        is_main: false
      });

    if (labelError) {
      toast.error('Error al crear etiqueta adicional');
      setShowConflictDialog(false);
      setConflictPackage(null);
      return;
    }

    // Increment the current bulto count IMMEDIATELY
    const { data: currentBulto } = await supabase
      .from('bultos')
      .select('total_packages')
      .eq('id', selectedBultoId)
      .single();

    if (currentBulto) {
      await supabase
        .from('bultos')
        .update({ total_packages: currentBulto.total_packages + 1 })
        .eq('id', selectedBultoId);
    }

    // Invalidate queries to refresh the UI immediately
    queryClient.invalidateQueries({ queryKey: ['packages'] });
    queryClient.invalidateQueries({ queryKey: ['open-bultos'] });
    queryClient.invalidateQueries({ queryKey: ['bulto-packages'] });
    
    toast.success('Paquete adicional agregado', {
      description: `El paquete ahora tiene ${newLabelCount} etiquetas y está en ambos bultos`
    });

    setShowConflictDialog(false);
    setConflictPackage(null);
  };

  const handleRemovePackage = (packageId: string) => {
    setScannedPackages(prev => prev.filter(p => p.id !== packageId));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (scannedPackages.length === 0) {
        throw new Error('No hay paquetes para guardar');
      }

      // For each scanned package, create a label entry
      for (const pkg of scannedPackages) {
        // Update package bulto_id for the main reference
        await supabase
          .from('packages')
          .update({ bulto_id: selectedBultoId })
          .eq('id', pkg.id);

        // Create a label entry for this package in this bulto
        const labelNumber = (pkg.label_count || 1);
        await supabase
          .from('package_labels')
          .insert({
            package_id: pkg.id,
            bulto_id: selectedBultoId,
            label_number: labelNumber,
            is_main: true
          });
      }

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

          <PackageConflictDialog
            open={showConflictDialog}
            packageInfo={conflictPackage ? {
              tracking_number: conflictPackage.tracking_number,
              bulto_number: conflictPackage.bultos?.bulto_number,
              customer_name: conflictPackage.customers?.name
            } : null}
            onMove={handleMovePackage}
            onAddAdditional={handleAddAdditionalPackage}
            onCancel={() => {
              setShowConflictDialog(false);
              setConflictPackage(null);
            }}
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
