import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FidelizationTable } from '@/components/fidelization/FidelizationTable';
import { CustomerDetailModal } from '@/components/fidelization/CustomerDetailModal';
import { PointRedemptionPanel } from '@/components/fidelization/PointRedemptionPanel';
import { useFidelizationData, DateFilter, FidelizationCustomer } from '@/hooks/useFidelizationData';
import { Trophy, Users, Star, Award } from 'lucide-react';

export function FidelizationTab() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<FidelizationCustomer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: fidelizationData = [], isLoading, error } = useFidelizationData(dateFilter);

  const handleCustomerClick = (customer: FidelizationCustomer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const topCustomer = fidelizationData[0];
  const totalCustomers = fidelizationData.length;
  const totalPoints = fidelizationData.reduce((sum, customer) => sum + customer.totalPoints, 0);
  const totalShipments = fidelizationData.reduce((sum, customer) => sum + customer.totalShipments, 0);

  const getFilterLabel = (filter: DateFilter) => {
    switch (filter) {
      case 'week': return 'Esta semana';
      case 'month': return 'Este mes';
      default: return 'Histórico total';
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error al cargar datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No se pudieron cargar los datos de fidelización. Por favor, intenta de nuevo.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Point Redemption Panel */}
      <PointRedemptionPanel />

      {/* Header with stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {getFilterLabel(dateFilter)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntos Totales</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Puntos acumulados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envíos Totales</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShipments}</div>
            <p className="text-xs text-muted-foreground">
              Envíos realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Líder</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{topCustomer?.name || '-'}</div>
            <p className="text-xs text-muted-foreground">
              {topCustomer ? `${topCustomer.totalPoints} puntos` : 'Sin datos'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Ranking de Fidelización
              </CardTitle>
               <CardDescription>
                 Ranking de clientes ordenado por puntos acumulados. Los puntos se calculan como 60 puntos base + 10 puntos por kilo.
                 <br />
                 <strong>Solo se cuentan envíos entregados y pagados del último año.</strong>
               </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {getFilterLabel(dateFilter)}
              </Badge>
              <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="all">Histórico total</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FidelizationTable 
            data={fidelizationData} 
            isLoading={isLoading}
            dateFilter={dateFilter}
            onCustomerClick={handleCustomerClick}
          />
        </CardContent>
      </Card>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}