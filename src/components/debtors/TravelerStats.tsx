
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface TravelerStatsProps {
  travelerStats: any[];
}

export function TravelerStats({ travelerStats }: TravelerStatsProps) {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-CO')}`;
  };

  const getEfficiencyColor = (delivered: number, total: number) => {
    const efficiency = total > 0 ? (delivered / total) * 100 : 0;
    if (efficiency >= 90) return 'bg-green-100 text-green-800';
    if (efficiency >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getEfficiencyLabel = (delivered: number, total: number) => {
    const efficiency = total > 0 ? (delivered / total) * 100 : 0;
    return `${efficiency.toFixed(1)}%`;
  };

  const getCollectionEfficiency = (collected: number, toCollect: number) => {
    return toCollect > 0 ? (collected / toCollect) * 100 : 0;
  };

  const getCollectionColor = (collected: number, toCollect: number) => {
    const efficiency = getCollectionEfficiency(collected, toCollect);
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas por Viajero</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Viajero</TableHead>
              <TableHead>Total Paquetes</TableHead>
              <TableHead>Entregados</TableHead>
              <TableHead>Pendientes</TableHead>
              <TableHead>Eficiencia Entrega</TableHead>
              <TableHead>Por Cobrar</TableHead>
              <TableHead>Cobrado</TableHead>
              <TableHead>Pendiente</TableHead>
              <TableHead>Eficiencia Cobranza</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {travelerStats.map((traveler) => {
              const collectionEfficiency = getCollectionEfficiency(
                traveler.totalCollected, 
                traveler.totalAmountToCollect
              );
              
              return (
                <TableRow key={traveler.id}>
                  <TableCell className="font-medium">
                    {traveler.name}
                  </TableCell>
                  <TableCell>{traveler.totalPackages}</TableCell>
                  <TableCell className="text-green-600">
                    {traveler.deliveredPackages}
                  </TableCell>
                  <TableCell className="text-orange-600">
                    {traveler.pendingPackages}
                  </TableCell>
                  <TableCell>
                    <Badge className={getEfficiencyColor(traveler.deliveredPackages, traveler.totalPackages)}>
                      {getEfficiencyLabel(traveler.deliveredPackages, traveler.totalPackages)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(traveler.totalAmountToCollect)}
                  </TableCell>
                  <TableCell className="text-green-600">
                    {formatCurrency(traveler.totalCollected)}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {formatCurrency(traveler.pendingAmount)}
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getCollectionColor(traveler.totalCollected, traveler.totalAmountToCollect)}`}>
                      {collectionEfficiency.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(traveler.revenue)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
