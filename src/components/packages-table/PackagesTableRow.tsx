
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { PackageActionsDropdown } from '../PackageActionsDropdown';
import { PackageStatusBadge } from './PackageStatusBadge';
import { PackageRouteDisplay } from './PackageRouteDisplay';
import { formatPackageDescription } from '@/utils/descriptionFormatter';
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';

interface Package {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  description: string;
  trip_id: string | null;
  customer_id: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: string;
  customers?: {
    name: string;
    email: string;
  };
}

interface PackagesTableRowProps {
  package: Package;
  onRowClick: (pkg: Package) => void;
  onActionsClick: (e: React.MouseEvent) => void;
  onUpdate: () => void;
  onOpenChat?: (customerId: string, customerName?: string) => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
  showChatInSeparateColumn?: boolean;
}

export function PackagesTableRow({ 
  package: pkg, 
  onRowClick, 
  onActionsClick, 
  onUpdate,
  onOpenChat,
  previewRole,
  disableChat = false,
  showChatInSeparateColumn = false
}: PackagesTableRowProps) {
  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);
  
  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return `$${value.toLocaleString('es-CO')}`;
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenChat && !disableChat && userRole?.role === 'admin') {
      onOpenChat(pkg.customer_id, pkg.customers?.name);
    }
  };

  const canChat = !disableChat && userRole?.role === 'admin' && onOpenChat;

  return (
    <TableRow 
      className={`hover:bg-gray-50 ${
        pkg.status !== 'delivered' 
          ? 'cursor-pointer transition-colors' 
          : 'cursor-default'
      }`}
      onClick={() => onRowClick(pkg)}
    >
      <TableCell className="font-medium">{pkg.tracking_number}</TableCell>
      <TableCell>{pkg.customers?.name || 'N/A'}</TableCell>
      <TableCell>
        <PackageRouteDisplay 
          status={pkg.status}
          origin={pkg.origin}
          destination={pkg.destination}
        />
      </TableCell>
      <TableCell>
        <PackageStatusBadge status={pkg.status} />
      </TableCell>
      <TableCell>{format(new Date(pkg.created_at), 'dd/MM/yyyy')}</TableCell>
      <TableCell className="max-w-xs truncate">{formatPackageDescription(pkg.description)}</TableCell>
      <TableCell>{formatCurrency(pkg.amount_to_collect)}</TableCell>
      
      {showChatInSeparateColumn && (
        <TableCell onClick={onActionsClick}>
          {canChat ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleChatClick}
              className="h-8 w-8 p-0"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          ) : (
            <div className="h-8 w-8" />
          )}
        </TableCell>
      )}
      
      <TableCell onClick={onActionsClick}>
        <PackageActionsDropdown 
          package={pkg} 
          onUpdate={onUpdate}
          onOpenChat={showChatInSeparateColumn ? undefined : onOpenChat}
          previewRole={previewRole}
          disableChat={showChatInSeparateColumn ? true : disableChat}
        />
      </TableCell>
    </TableRow>
  );
}
