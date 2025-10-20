import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, Medal, Star } from 'lucide-react';
import { FidelizationCustomer, DateFilter } from '@/hooks/useFidelizationData';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface FidelizationTableProps {
  data: FidelizationCustomer[];
  isLoading: boolean;
  dateFilter: DateFilter;
  onCustomerClick: (customer: FidelizationCustomer) => void;
}

export function FidelizationTable({ data, isLoading, dateFilter, onCustomerClick }: FidelizationTableProps) {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Trophy className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return <Star className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPositionBadge = (position: number) => {
    const suffix = position === 1 ? '°' : position === 2 ? '°' : position === 3 ? '°' : '°';
    
    if (position === 1) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 font-bold">
          {position}{suffix}
        </Badge>
      );
    }
    
    if (position <= 3) {
      return (
        <Badge variant="secondary" className="font-semibold">
          {position}{suffix}
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline">
        {position}{suffix}
      </Badge>
    );
  };

  const getRowClassName = (position: number) => {
    if (position === 1) {
      return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 hover:from-yellow-100 hover:to-amber-100";
    }
    return "hover:bg-muted/50";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando ranking...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Sin datos de fidelización
          </h3>
          <p className="text-sm text-muted-foreground">
            No hay envíos registrados para el período seleccionado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Posición</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-center">Envíos Totales</TableHead>
            <TableHead className="text-center">Mejor Racha</TableHead>
            <TableHead className="text-center">Último Envío</TableHead>
            <TableHead className="text-right">Puntos Acumulados</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((customer) => (
            <TableRow 
              key={customer.id} 
              className={cn(getRowClassName(customer.position), "cursor-pointer")}
              onClick={() => onCustomerClick(customer)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  {getPositionIcon(customer.position)}
                  {getPositionBadge(customer.position)}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {customer.name}
                  {customer.position === 1 && (
                    <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 text-xs">
                      👑 LÍDER
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="font-mono">
                  {customer.totalShipments}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-mono">{customer.bestStreak}</span>
                  {customer.bestStreak > 1 && (
                    <span className="text-xs text-muted-foreground">
                      día{customer.bestStreak > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {customer.lastShipmentDate ? (
                  <div className="text-sm">
                    {format(parseISO(customer.lastShipmentDate), 'dd/MM/yyyy', { locale: es })}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="font-bold text-lg">
                  {customer.totalPoints.toLocaleString()}
                  <span className="text-xs text-muted-foreground ml-1">pts</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}