
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useCreateBatch } from '@/hooks/useShipmentBatches';
import { usePackagesByTrip } from '@/hooks/usePackagesByTrip';
import { Package, Weight, DollarSign, Truck } from 'lucide-react';

interface CreateBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
}

export function CreateBatchDialog({ open, onOpenChange, tripId }: CreateBatchDialogProps) {
  const [destination, setDestination] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { data: packages = [], isLoading } = usePackagesByTrip(tripId);
  const createBatchMutation = useCreateBatch();

  // Filter packages that don't have a batch assigned yet
  const availablePackages = packages.filter(pkg => !pkg.batch_id);

  // Group available packages by destination
  const packagesByDestination = availablePackages.reduce((acc, pkg) => {
    if (!acc[pkg.destination]) {
      acc[pkg.destination] = [];
    }
    acc[pkg.destination].push(pkg);
    return acc;
  }, {} as Record<string, typeof packages>);

  const destinations = Object.keys(packagesByDestination);

  const handleDestinationChange = (newDestination: string) => {
    setDestination(newDestination);
    // Clear previous selection when changing destination
    setSelectedPackages([]);
  };

  const handlePackageToggle = (packageId: string, checked: boolean) => {
    setSelectedPackages(prev => 
      checked 
        ? [...prev, packageId]
        : prev.filter(id => id !== packageId)
    );
  };

  const handleSelectAllForDestination = () => {
    if (!destination) return;
    
    const packagesForDestination = packagesByDestination[destination] || [];
    const allPackageIds = packagesForDestination.map(pkg => pkg.id);
    
    // If all packages are already selected, deselect them; otherwise select all
    const allSelected = allPackageIds.every(id => selectedPackages.includes(id));
    if (allSelected) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(allPackageIds);
    }
  };

  const handleCreateBatch = async () => {
    if (!destination.trim()) {
      toast({
        title: "Error",
        description: "Por favor selecciona un destino",
        variant: "destructive"
      });
      return;
    }

    if (selectedPackages.length === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona al menos una encomienda",
        variant: "destructive"
      });
      return;
    }

    try {
      await createBatchMutation.mutateAsync({
        trip_id: tripId,
        destination,
        package_ids: selectedPackages
      });

      toast({
        title: "Bulto creado",
        description: `Bulto creado exitosamente con ${selectedPackages.length} encomienda${selectedPackages.length > 1 ? 's' : ''}`
      });

      onOpenChange(false);
      setDestination('');
      setSelectedPackages([]);
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el bulto",
        variant: "destructive"
      });
    }
  };

  const selectedPackagesData = availablePackages.filter(pkg => selectedPackages.includes(pkg.id));
  const totals = selectedPackagesData.reduce(
    (acc, pkg) => ({
      weight: acc.weight + (pkg.weight || 0),
      freight: acc.freight + (pkg.freight || 0),
      amount_to_collect: acc.amount_to_collect + (pkg.amount_to_collect || 0)
    }),
    { weight: 0, freight: 0, amount_to_collect: 0 }
  );

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-CO')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Bulto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Destination Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Seleccionar Destino
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {destinations.map((dest) => (
                <Button
                  key={dest}
                  variant={destination === dest ? "default" : "outline"}
                  onClick={() => handleDestinationChange(dest)}
                  className="justify-start"
                >
                  {dest} ({packagesByDestination[dest].length} encomiendas)
                </Button>
              ))}
            </div>
            
            {destinations.length === 0 && (
              <p className="text-gray-500 text-sm mt-2">
                No hay encomiendas disponibles para crear bultos en este viaje
              </p>
            )}
          </div>

          {/* Package Selection */}
          {destination && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">
                  Encomiendas para {destination}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllForDestination}
                >
                  {selectedPackages.length === packagesByDestination[destination]?.length 
                    ? 'Deseleccionar Todo' 
                    : 'Seleccionar Todo'
                  }
                </Button>
              </div>
              
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                <div className="space-y-2 p-3">
                  {packagesByDestination[destination]?.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        id={pkg.id}
                        checked={selectedPackages.includes(pkg.id)}
                        onCheckedChange={(checked) => 
                          handlePackageToggle(pkg.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">
                            {pkg.tracking_number}
                          </div>
                          <div className="text-xs text-gray-500">
                            {pkg.customers?.name || 'Sin cliente'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Weight className="h-3 w-3" />
                            {pkg.weight || 0} kg
                          </span>
                          <span className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            {formatCurrency(pkg.freight || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(pkg.amount_to_collect || 0)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {pkg.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {selectedPackages.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                Resumen del Bulto ({selectedPackages.length} encomienda{selectedPackages.length > 1 ? 's' : ''})
              </h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-blue-600">Encomiendas</div>
                    <div className="font-bold">{selectedPackages.length}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-blue-600">Peso Total</div>
                    <div className="font-bold">{totals.weight} kg</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-blue-600">Flete Total</div>
                    <div className="font-bold">{formatCurrency(totals.freight)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-green-600">A Cobrar</div>
                    <div className="font-bold text-green-700">{formatCurrency(totals.amount_to_collect)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateBatch}
              disabled={selectedPackages.length === 0 || !destination || createBatchMutation.isPending}
            >
              {createBatchMutation.isPending ? 'Creando...' : `Crear Bulto${selectedPackages.length > 1 ? ` (${selectedPackages.length} encomiendas)` : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
