
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { MessageCircle, Edit, Package, Trash2 } from 'lucide-react';
import { PhoneWithFlag } from '@/components/PhoneWithFlag';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  created_at: string;
  package_count: number;
}

interface CustomersTableRowProps {
  customer: Customer;
  onChatClick: (customerId: string) => void;
  onEditClick: (customerId: string) => void;
  onDeleteClick: (customerId: string) => void;
}

export function CustomersTableRow({ 
  customer, 
  onChatClick, 
  onEditClick,
  onDeleteClick 
}: CustomersTableRowProps) {
  return (
    <TableRow key={customer.id}>
      <TableCell className="font-medium">
        {customer.name}
      </TableCell>
      <TableCell>
        <PhoneWithFlag phone={customer.phone} />
      </TableCell>
      <TableCell>
        {customer.address ? (
          <span className="text-sm">{customer.address}</span>
        ) : (
          <span className="text-gray-400 text-sm">Sin dirección</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
            {customer.package_count}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChatClick(customer.id)}
            className="h-8 w-8 p-0"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditClick(customer.id)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteClick(customer.id)}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
