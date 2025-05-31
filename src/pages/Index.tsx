
import { useState } from 'react';
import { Package, Users, TrendingUp, MapPin, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo
  const stats = [
    {
      title: "Total Encomiendas",
      value: "1,234",
      change: "+12%",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Clientes Activos",
      value: "456",
      change: "+8%",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Ingresos del Mes",
      value: "$45,678",
      change: "+15%",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "En Tránsito",
      value: "89",
      change: "-3%",
      icon: MapPin,
      color: "text-orange-600"
    }
  ];

  const recentPackages = [
    {
      id: "EO-2024-001",
      cliente: "María González",
      origen: "Barranquilla",
      destino: "Curazao",
      estado: "En tránsito",
      fecha: "2024-01-15",
      valor: "$120"
    },
    {
      id: "EO-2024-002",
      cliente: "Carlos Mendoza",
      origen: "Curazao",
      destino: "Barranquilla",
      estado: "Entregado",
      fecha: "2024-01-14",
      valor: "$85"
    },
    {
      id: "EO-2024-003",
      cliente: "Ana Rodríguez",
      origen: "Barranquilla",
      destino: "Curazao",
      estado: "Pendiente",
      fecha: "2024-01-16",
      valor: "$200"
    }
  ];

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Entregado":
        return "bg-green-100 text-green-800";
      case "En tránsito":
        return "bg-blue-100 text-blue-800";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Envíos Ojitos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar encomienda..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Encomienda
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
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

        {/* Recent Packages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Encomiendas Recientes</CardTitle>
            <CardDescription>
              Últimas encomiendas registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPackages.map((pkg) => (
                  <TableRow key={pkg.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{pkg.id}</TableCell>
                    <TableCell>{pkg.cliente}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-sm">{pkg.origen}</span>
                        <span className="mx-2">→</span>
                        <span className="text-sm">{pkg.destino}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pkg.estado)}>
                        {pkg.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{pkg.fecha}</TableCell>
                    <TableCell className="font-medium">{pkg.valor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                Ver Reportes
              </CardTitle>
              <CardDescription>
                Analiza el rendimiento de tu negocio
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
