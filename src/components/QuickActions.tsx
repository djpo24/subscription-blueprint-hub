
import { Package, Users, TrendingUp, Plane } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickActionsProps {
  onPackageClick: () => void;
  onCustomerClick: () => void;
  onTripClick: () => void;
}

export function QuickActions({ onPackageClick, onCustomerClick, onTripClick }: QuickActionsProps) {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={onTripClick}
      >
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plane className="h-5 w-5 mr-2 text-purple-600" />
            Crear Viaje
          </CardTitle>
          <CardDescription>
            Programa un nuevo viaje para agrupar encomiendas
          </CardDescription>
        </CardHeader>
      </Card>

      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={onPackageClick}
      >
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-600" />
            Crear Encomienda
          </CardTitle>
          <CardDescription>
            Registra una nueva encomienda en el sistema
          </CardDescription>
        </CardHeader>
      </Card>

      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={onCustomerClick}
      >
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            Gestionar Clientes
          </CardTitle>
          <CardDescription>
            Administra la información de tus clientes
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
            Ver Reportes
          </CardTitle>
          <CardDescription>
            Analiza el rendimiento de tu negocio
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
