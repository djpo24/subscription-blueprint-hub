
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package } from 'lucide-react';
import { CustomersTableRow } from './CustomersTableRow';
import { CustomersStatsSection } from './CustomersStatsSection';
import { CustomersPagination } from './CustomersPagination';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  created_at: string;
  package_count: number;
}

interface CustomersTableProps {
  customers: Customer[];
  filteredCustomers: Customer[];
  paginatedCustomers: Customer[];
  searchCustomerId: string | null;
  onChatClick: (customerId: string) => void;
  onEditClick: (customerId: string) => void;
  onDeleteClick: (customerId: string) => void;
  canDelete?: boolean;
  // Pagination props
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  pageSize: number;
}

export function CustomersTable({
  customers,
  filteredCustomers,
  paginatedCustomers,
  searchCustomerId,
  onChatClick,
  onEditClick,
  onDeleteClick,
  canDelete = false,
  currentPage,
  totalPages,
  onPageChange,
  onPreviousPage,
  onNextPage,
  pageSize
}: CustomersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <CustomersStatsSection
            searchCustomerId={searchCustomerId}
            filteredCustomersCount={filteredCustomers.length}
            totalCustomersCount={customers.length}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Package className="h-4 w-4" />
                    Envíos
                  </div>
                </TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.map((customer) => (
                <CustomersTableRow
                  key={customer.id}
                  customer={customer}
                  onChatClick={onChatClick}
                  onEditClick={onEditClick}
                  onDeleteClick={onDeleteClick}
                  canDelete={canDelete}
                />
              ))}
              {paginatedCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    {searchCustomerId ? "No se encontró el cliente buscado" : "No hay clientes registrados"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <CustomersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          totalCustomers={filteredCustomers.length}
          pageSize={pageSize}
        />
      </CardContent>
    </Card>
  );
}
