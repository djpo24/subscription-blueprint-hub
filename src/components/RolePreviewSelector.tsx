
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, Briefcase, Truck } from 'lucide-react';
import { TravelerPreviewPanel } from './TravelerPreviewPanel';

export function RolePreviewSelector() {
  const [selectedPreview, setSelectedPreview] = useState<'admin' | 'employee' | 'traveler' | null>(null);

  if (selectedPreview === 'traveler') {
    return <TravelerPreviewPanel onBack={() => setSelectedPreview(null)} />;
  }

  const roles = [
    {
      role: 'admin' as const,
      title: 'Administrador',
      description: 'Acceso completo a todas las funciones del sistema',
      icon: Users,
      color: 'bg-red-500',
      features: [
        'Panel de usuarios',
        'Gestión completa de encomiendas',
        'Configuración del sistema',
        'Reportes y estadísticas',
        'Notificaciones',
        'Gestión de viajeros'
      ]
    },
    {
      role: 'employee' as const,
      title: 'Empleado',
      description: 'Acceso a operaciones diarias sin gestión de usuarios',
      icon: Briefcase,
      color: 'bg-blue-500',
      features: [
        'Gestión de encomiendas',
        'Gestión de viajes',
        'Chat con clientes',
        'Despachos',
        'Deudores',
        'Notificaciones',
        'Configuración básica'
      ]
    },
    {
      role: 'traveler' as const,
      title: 'Viajero',
      description: 'Acceso a viajes, despachos y deudores asignados',
      icon: Truck,
      color: 'bg-green-500',
      features: [
        'Ver viajes asignados',
        'Ver despachos relacionados',
        'Ver deudores relacionados',
        'Ver paquetes de sus viajes',
        'Chat básico',
        'Sin acceso a notificaciones, usuarios o configuración'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vista Preview por Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Selecciona un rol para ver cómo se ve el panel desde la perspectiva de ese usuario.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((roleInfo) => {
              const Icon = roleInfo.icon;
              return (
                <Card key={roleInfo.role} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${roleInfo.color} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{roleInfo.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {roleInfo.role}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {roleInfo.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium">Funciones disponibles:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {roleInfo.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedPreview(roleInfo.role)}
                      disabled={roleInfo.role !== 'traveler'} // Solo traveler implementado por ahora
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {roleInfo.role === 'traveler' ? 'Ver Preview' : 'Próximamente'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
