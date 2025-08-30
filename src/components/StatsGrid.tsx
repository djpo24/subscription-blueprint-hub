
import { Package, Users, TrendingUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsData {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  transito?: number; // Agregamos el estado en español
}

interface StatsGridProps {
  packageStats?: StatsData;
  customersCount: number;
  onStatClick: (statType: string) => void;
}

export function StatsGrid({ packageStats, customersCount, onStatClick }: StatsGridProps) {
  // Usar el estado correcto 'transito' o fallback a 'inTransit'
  const inTransitCount = packageStats?.transito || packageStats?.inTransit || 0;
  
  // Helper function to safely convert to string
  const safeToString = (value: number | undefined): string => {
    return (value ?? 0).toString();
  };
  
  const stats = [
    {
      title: "Total Encomiendas",
      value: safeToString(packageStats?.total),
      change: "+12%",
      icon: Package,
      color: "text-black",
      type: "packages"
    },
    {
      title: "Clientes Activos",
      value: customersCount.toString(),
      change: "+8%",
      icon: Users,
      color: "text-black",
      type: "customers"
    },
    {
      title: "En Tránsito",
      value: inTransitCount.toString(),
      change: "-3%",
      icon: MapPin,
      color: "text-black",
      type: "in-transit"
    },
    {
      title: "Entregados",
      value: safeToString(packageStats?.delivered),
      change: "+15%",
      icon: TrendingUp,
      color: "text-black",
      type: "delivered"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="bg-gray-100 border-0 rounded-2xl shadow-none hover:bg-gray-200 transition-all duration-200 cursor-pointer"
          onClick={() => onStatClick(stat.type)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stat.value}</div>
            <p className="text-xs text-gray-600">
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
