
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Calendar, Warehouse, Edit, Printer, MessageSquare } from 'lucide-react';
import { ReschedulePackageDialog } from './ReschedulePackageDialog';
import { EditPackageDialog } from './EditPackageDialog';
import { PackageLabelDialog } from './PackageLabelDialog';
import { usePackageActions } from '@/hooks/usePackageActions';

interface Package {
  id: string;
  tracking_number: string;
  status: string;
  trip_id: string | null;
  customer_id: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  origin: string;
  destination: string;
  created_at: string;
  customers?: {
    name: string;
    email: string;
  };
}

interface PackageActionsDropdownProps {
  package: Package;
  onUpdate: () => void;
  onOpenChat?: (customerId: string, customerName?: string) => void;
}

export function PackageActionsDropdown({ 
  package: pkg, 
  onUpdate, 
  onOpenChat 
}: PackageActionsDropdownProps) {
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const { moveToWarehouse, isMovingToWarehouse } = usePackageActions();

  const handleMoveToWarehouse = async () => {
    await moveToWarehouse(pkg.id);
    onUpdate();
  };

  const handleOpenChat = () => {
    if (onOpenChat) {
      onOpenChat(pkg.customer_id, pkg.customers?.name);
    }
  };

  const canReschedule = pkg.status !== 'delivered' && pkg.status !== 'bodega';
  const canMoveToWarehouse = pkg.status !== 'delivered' && pkg.status !== 'bodega';
  const canEdit = pkg.status !== 'delivered';

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
          <DropdownMenuItem onClick={handleOpenChat}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Abrir chat
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowLabelDialog(true)}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir etiqueta
          </DropdownMenuItem>
          {canEdit && (
            <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar encomienda
            </DropdownMenuItem>
          )}
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

      <PackageLabelDialog
        open={showLabelDialog}
        onOpenChange={setShowLabelDialog}
        package={pkg}
      />

      <EditPackageDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        package={pkg}
        onSuccess={onUpdate}
      />

      <ReschedulePackageDialog
        open={showRescheduleDialog}
        onOpenChange={setShowRescheduleDialog}
        package={pkg}
        onSuccess={onUpdate}
      />
    </>
  );
}
