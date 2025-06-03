
import { TableCell, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { PackageActionsDropdown } from '../PackageActionsDropdown';
import { PackageStatusBadge } from './PackageStatusBadge';
import { PackageRouteDisplay } from './PackageRouteDisplay';

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
}

export function PackagesTableRow({ 
  package: pkg, 
  onRowClick, 
  onActionsClick, 
  onUpdate,
  onOpenChat,
  previewRole,
  disableChat = false
}: PackagesTableRowProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return `$${value.toLocaleString('es-CO')}`;
  };

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
      <TableCell className="max-w-xs truncate">{pkg.description}</TableCell>
      <TableCell>{pkg.weight ? `${pkg.weight} kg` : 'N/A'}</TableCell>
      <TableCell>{formatCurrency(pkg.freight)}</TableCell>
      <TableCell>{formatCurrency(pkg.amount_to_collect)}</TableCell>
      <TableCell onClick={onActionsClick}>
        <PackageActionsDropdown 
          package={pkg} 
          onUpdate={onUpdate}
          onOpenChat={onOpenChat}
          previewRole={previewRole}
          disableChat={disableChat}
        />
      </TableCell>
    </TableRow>
  );
}
