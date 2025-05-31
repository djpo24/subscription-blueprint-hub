
import { Package, Users, TrendingUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsData {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
}

interface StatsGridProps {
  packageStats?: StatsData;
  customersCount: number;
}

export function StatsGrid({ packageStats, customersCount }: StatsGridProps) {
  const stats = [
    {
      title: "Total Encomiendas",
      value: packageStats?.total.toString() || "0",
      change: "+12%",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Clientes Activos",
      value: customersCount.toString(),
      change: "+8%",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "En Tránsito",
      value: packageStats?.inTransit.toString() || "0",
      change: "-3%",
      icon: MapPin,
      color: "text-orange-600"
    },
    {
      title: "Entregados",
      value: packageStats?.delivered.toString() || "0",
      change: "+15%",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                {stat.change}
              </span>
              {' '}desde el mes pasado
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
