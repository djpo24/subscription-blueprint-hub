
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Calendar, Warehouse } from 'lucide-react';
import { ReschedulePackageDialog } from './ReschedulePackageDialog';
import { usePackageActions } from '@/hooks/usePackageActions';

interface Package {
  id: string;
  tracking_number: string;
  status: string;
  trip_id: string | null;
}

interface PackageActionsDropdownProps {
  package: Package;
  onUpdate: () => void;
}

export function PackageActionsDropdown({ package: pkg, onUpdate }: PackageActionsDropdownProps) {
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const { moveToWarehouse, isMovingToWarehouse } = usePackageActions();

  const handleMoveToWarehouse = async () => {
    await moveToWarehouse(pkg.id);
    onUpdate();
  };

  const canReschedule = pkg.status !== 'delivered' && pkg.status !== 'warehouse';
  const canMoveToWarehouse = pkg.status !== 'delivered' && pkg.status !== 'warehouse';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canReschedule && (
            <DropdownMenuItem onClick={() => setShowRescheduleDialog(true)}>
              <Calendar className="mr-2 h-4 w-4" />
              Reprogramar viaje
            </DropdownMenuItem>
          )}
          {canMoveToWarehouse && (
            <DropdownMenuItem 
              onClick={handleMoveToWarehouse}
              disabled={isMovingToWarehouse}
            >
              <Warehouse className="mr-2 h-4 w-4" />
              Mover a bodega
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ReschedulePackageDialog
        open={showRescheduleDialog}
        onOpenChange={setShowRescheduleDialog}
        package={pkg}
        onSuccess={onUpdate}
      />
    </>
  );
}
