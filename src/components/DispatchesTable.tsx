
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Package, Weight, DollarSign, Calendar, Eye } from 'lucide-react';
import { useDispatchRelations } from '@/hooks/useDispatchRelations';
import { useIsMobile } from '@/hooks/use-mobile';

interface DispatchesTableProps {
  selectedDate?: Date;
  onViewDispatch: (dispatchId: string) => void;
}

export function DispatchesTable({ selectedDate, onViewDispatch }: DispatchesTableProps) {
  const { data: dispatches = [], isLoading } = useDispatchRelations(selectedDate);
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'procesado':
        return 'bg-orange-100 text-orange-800';
      case 'en_transito':
        return 'bg-blue-100 text-blue-800';
      case 'llegado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'procesado':
        return 'Procesado';
      case 'en_transito':
        return 'En Tránsito';
      case 'llegado':
        return 'Llegado';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '$0';
    return `$${value.toLocaleString('es-CO')}`;
  };

  const formatWeight = (weight: number | null | undefined) => {
    if (!weight) return '0';
    // Convertir a número y eliminar decimales innecesarios
    const numWeight = Number(weight);
    return numWeight % 1 === 0 ? numWeight.toString() : numWeight.toFixed(1);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500 text-sm">
            Cargando despachos...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vista móvil con cards
  if (isMobile) {
    return (
      <Card>
        <CardHeader className="px-3 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5" />
            Despachos
            {selectedDate && (
              <span className="text-sm font-normal text-gray-600 block mt-1">
                {format(selectedDate, "d 'de' MMMM", { locale: es })}
              </span>
            )}
          </CardTitle>
          <div className="text-sm text-gray-600">
            {dispatches.length} despacho{dispatches.length !== 1 ? 's' : ''}
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {dispatches.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-2">
                No hay despachos
              </h3>
              <p className="text-sm text-gray-500">
                {selectedDate 
                  ? `No se encontraron despachos para la fecha seleccionada`
                  : 'No se han creado despachos aún'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dispatches.map((dispatch) => (
                <Card key={dispatch.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-sm">
                              {format(new Date(dispatch.dispatch_date), 'dd/MM/yyyy')}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3 text-blue-500" />
                              <span>{dispatch.total_packages} paquetes</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Weight className="h-3 w-3 text-purple-500" />
                              <span>{formatWeight(dispatch.total_weight)} kg</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(dispatch.status)} text-xs`}>
                          {getStatusLabel(dispatch.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Flete:</span>
                          <span className="font-medium ml-1">{formatCurrency(dispatch.total_freight)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">A Cobrar:</span>
                          <span className="font-medium text-green-600 ml-1">
                            {formatCurrency(dispatch.total_amount_to_collect)}
                          </span>
                        </div>
                      </div>

                      {dispatch.notes && (
                        <div className="text-sm">
                          <span className="text-gray-500">Notas:</span>
                          <p className="text-gray-700 truncate mt-1">{dispatch.notes}</p>
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDispatch(dispatch.id)}
                        className="w-full flex items-center gap-2"
                      >
                        <Eye className="h-3 w-3" />
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Vista desktop con tabla
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Despachos
          {selectedDate && (
            <span className="text-sm font-normal text-gray-600">
              - {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </span>
          )}
        </CardTitle>
        <div className="text-sm text-gray-600">
          {dispatches.length} despacho{dispatches.length !== 1 ? 's' : ''} 
          {selectedDate ? ' en la fecha seleccionada' : ' en total'}
        </div>
      </CardHeader>
      <CardContent>
        {dispatches.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay despachos
            </h3>
            <p className="text-gray-500">
              {selectedDate 
                ? `No se encontraron despachos para ${format(selectedDate, "d 'de' MMMM", { locale: es })}`
                : 'No se han creado despachos aún'
              }
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Paquetes</TableHead>
                <TableHead>Peso Total</TableHead>
                <TableHead>Flete Total</TableHead>
                <TableHead>A Cobrar</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dispatches.map((dispatch) => (
                <TableRow key={dispatch.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {format(new Date(dispatch.dispatch_date), 'dd/MM/yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{dispatch.total_packages}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-purple-500" />
                      <span>{formatWeight(dispatch.total_weight)} kg</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-orange-500" />
                      <span>{formatCurrency(dispatch.total_freight)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-700">
                        {formatCurrency(dispatch.total_amount_to_collect)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(dispatch.status)}>
                      {getStatusLabel(dispatch.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-32 truncate text-sm text-gray-600">
                      {dispatch.notes || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDispatch(dispatch.id)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
