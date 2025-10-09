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
  const [scannedPackages, setScannedPackages] = useState<any[]>([]);
  const [conflictPackage, setConflictPackage] = useState<any>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [manualSelectedBultoId, setManualSelectedBultoId] = useState<string>('');
  
  // Use preSelectedBultoId if provided, otherwise use manual selection
  const selectedBultoId = preSelectedBultoId || manualSelectedBultoId;

  // Log for debugging
  useEffect(() => {
    if (open) {
      console.log('[ScanToBulto] 🔍 Dialog opened with:');
      console.log('  - preSelectedBultoId:', preSelectedBultoId);
      console.log('  - manualSelectedBultoId:', manualSelectedBultoId);
      console.log('  - selectedBultoId:', selectedBultoId);
      console.log('  - tripId:', tripId);
    }
  }, [open, preSelectedBultoId, manualSelectedBultoId, selectedBultoId, tripId]);

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

  // Auto-select first bulto only if no preSelectedBultoId
  useEffect(() => {
    if (!preSelectedBultoId && openBultos && openBultos.length > 0 && !manualSelectedBultoId) {
      setManualSelectedBultoId(openBultos[0].id);
    }
  }, [openBultos, manualSelectedBultoId, preSelectedBultoId]);

  const handleScan = async (barcode: string) => {
    console.log('[ScanToBulto] Processing scan:', barcode);
    
    // Check if package exists
    const { data: pkg, error } = await supabase
      .from('packages')
      .select(`
        *,
        customers!packages_customer_id_fkey(name, email)
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

    // Check ALL bultos where this package appears (via package_labels)
    const { data: packageLabels } = await supabase
      .from('package_labels')
      .select(`
        *,
        bultos!package_labels_bulto_id_fkey(id, bulto_number)
      `)
      .eq('package_id', pkg.id);

    // Filter out current bulto
    const otherBultos = packageLabels?.filter(label => label.bulto_id !== selectedBultoId) || [];

    // If package is in other bultos, show conflict dialog
    if (otherBultos.length > 0) {
      setConflictPackage({
        ...pkg,
        existingLabels: packageLabels,
        otherBultos: otherBultos.map(label => ({
          id: label.bulto_id,
          bulto_number: label.bultos?.bulto_number,
          label_id: label.id,
          label_number: label.label_number,
          is_main: label.is_main
        }))
      });
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

  const handleMovePackage = async (selectedBultoIds: string[]) => {
    if (!conflictPackage) return;

    // Add to current list marked for moving from multiple bultos
    addPackageToList({ 
      ...conflictPackage, 
      bulto_id: selectedBultoId,
      is_moved: true,
      old_bulto_ids: selectedBultoIds // Array of bulto IDs to move from
    });
    
    toast.success('Paquete marcado para trasladar', {
      description: `Se trasladará desde ${selectedBultoIds.length} bulto(s) al guardar`
    });

    setShowConflictDialog(false);
    setConflictPackage(null);
  };

  const handleAddAdditionalPackage = async () => {
    if (!conflictPackage) return;

    // Add to scan list first (like normal scan flow)
    addPackageToList({ 
      ...conflictPackage, 
      bulto_id: selectedBultoId,
      label_count: (conflictPackage.label_count || 1) + 1,
      is_additional: true 
    });
    
    toast.success('Paquete adicional agregado a la lista', {
      description: `Se agregará como etiqueta adicional al guardar`
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
        const isAdditional = pkg.is_additional === true;
        const isMoved = pkg.is_moved === true;
        
        if (isAdditional) {
          // For additional packages: increment label_count and create new label WITHOUT moving
          const newLabelCount = pkg.label_count;
          
          await supabase
            .from('packages')
            .update({ label_count: newLabelCount })
            .eq('id', pkg.id);
          
          await supabase
            .from('package_labels')
            .insert({
              package_id: pkg.id,
              bulto_id: selectedBultoId,
              label_number: newLabelCount,
              is_main: false
            });
        } else if (isMoved) {
          // For moved packages: handle moving from multiple bultos
          const oldBultoIds = pkg.old_bulto_ids || [];
          
          // Delete labels from selected old bultos
          for (const oldBultoId of oldBultoIds) {
            await supabase
              .from('package_labels')
              .delete()
              .eq('package_id', pkg.id)
              .eq('bulto_id', oldBultoId);
            
            // Decrease old bulto count
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
          
          // Check if package still has labels in other bultos
          const { data: remainingLabels } = await supabase
            .from('package_labels')
            .select('*')
            .eq('package_id', pkg.id);
          
          // If no remaining labels, update main bulto_id
          if (!remainingLabels || remainingLabels.length === 0) {
            await supabase
              .from('packages')
              .update({ bulto_id: selectedBultoId })
              .eq('id', pkg.id);
          }
          
          // Create new label in current bulto
          await supabase
            .from('package_labels')
            .insert({
              package_id: pkg.id,
              bulto_id: selectedBultoId,
              label_number: 1,
              is_main: remainingLabels?.length === 0
            });
        } else {
          // For normal packages (first time or no previous bulto): update bulto_id and create main label
          await supabase
            .from('packages')
            .update({ bulto_id: selectedBultoId })
            .eq('id', pkg.id);

          await supabase
            .from('package_labels')
            .insert({
              package_id: pkg.id,
              bulto_id: selectedBultoId,
              label_number: 1,
              is_main: true
            });
        }
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
    setManualSelectedBultoId('');
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
                {!preSelectedBultoId && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Selecciona el Bulto
                    </label>
                    <Select value={selectedBultoId} onValueChange={setManualSelectedBultoId}>
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
                )}

                {selectedBulto ? (
                  <div className="p-4 bg-primary/10 border-2 border-primary rounded-lg">
                    <p className="text-base font-semibold text-primary">
                      📦 Escaneando para Bulto #{selectedBulto.bulto_number}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {scannedPackages.length} paquete(s) escaneados en esta sesión
                    </p>
                  </div>
                ) : selectedBultoId ? (
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <p className="text-sm font-medium text-yellow-700">
                      ⚠️ Cargando información del bulto...
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
                    <p className="text-sm font-medium text-orange-700">
                      ⚠️ Selecciona un bulto para comenzar a escanear
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
              customer_name: conflictPackage.customers?.name,
              otherBultos: conflictPackage.otherBultos
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
