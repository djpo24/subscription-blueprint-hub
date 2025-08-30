
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMarketingStats } from '@/hooks/useMarketingStats';
import { Send, Users, Clock, TrendingUp } from 'lucide-react';

export function MarketingStats() {
  const { data: stats, isLoading } = useMarketingStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Contactos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalContacts || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.activeContacts || 0} activos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Campañas Enviadas</CardTitle>
          <Send className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalCampaigns || 0}</div>
          <p className="text-xs text-muted-foreground">
            Este mes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mensajes Enviados</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalMessagesSent || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.successRate || 0}% exitosos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Última Campaña</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.daysSinceLastCampaign !== undefined 
              ? `${stats.daysSinceLastCampaign}d` 
              : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            hace {stats?.daysSinceLastCampaign || 0} días
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
