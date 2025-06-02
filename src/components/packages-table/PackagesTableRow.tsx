
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
}

export function PackagesTableRow({ 
  package: pkg, 
  onRowClick, 
  onActionsClick, 
  onUpdate 
}: PackagesTableRowProps) {
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
      <TableCell>{pkg.freight ? `$${pkg.freight.toLocaleString()}` : 'N/A'}</TableCell>
      <TableCell>{pkg.amount_to_collect ? `$${pkg.amount_to_collect.toLocaleString()}` : 'N/A'}</TableCell>
      <TableCell onClick={onActionsClick}>
        <PackageActionsDropdown 
          package={pkg} 
          onUpdate={onUpdate}
        />
      </TableCell>
    </TableRow>
  );
}
