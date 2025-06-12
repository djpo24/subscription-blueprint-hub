
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MarketingContact {
  id: string;
  customer_name: string;
  phone_number: string;
  is_active: boolean;
  last_message_sent_at: string | null;
  notes: string | null;
  created_at: string;
}

interface MarketingContactsTableProps {
  contacts: MarketingContact[];
  isLoading: boolean;
}

export function MarketingContactsTable({ contacts, isLoading }: MarketingContactsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay contactos de marketing registrados</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Último mensaje</TableHead>
          <TableHead>Notas</TableHead>
          <TableHead className="w-[70px]">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((contact) => (
          <TableRow key={contact.id}>
            <TableCell className="font-medium">{contact.customer_name}</TableCell>
            <TableCell>{contact.phone_number}</TableCell>
            <TableCell>
              <Badge variant={contact.is_active ? "default" : "secondary"}>
                {contact.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </TableCell>
            <TableCell>
              {contact.last_message_sent_at 
                ? new Date(contact.last_message_sent_at).toLocaleDateString('es-CO')
                : 'Nunca'
              }
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {contact.notes || '-'}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
