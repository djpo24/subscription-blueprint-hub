
import { useState, useEffect } from 'react';
import { Package, Users, TrendingUp, MapPin, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { PackageDialog } from '@/components/PackageDialog';
import { CustomerDialog } from '@/components/CustomerDialog';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);

  // Fetch packages with customer information
  const { data: packages = [], isLoading: packagesLoading, refetch: refetchPackages } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          customers (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch customers count
  const { data: customersCount = 0 } = useQuery({
    queryKey: ['customers-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch packages count by status
  const { data: packageStats } = useQuery({
    queryKey: ['package-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('status');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        pending: data.filter(p => p.status === 'pending').length,
        inTransit: data.filter(p => p.status === 'in_transit').length,
        delivered: data.filter(p => p.status === 'delivered').length
      };
      
      return stats;
    }
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "delayed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return "Entregado";
      case "in_transit":
        return "En Tránsito";
      case "pending":
        return "Pendiente";
      case "delayed":
        return "Retrasado";
      default:
        return status;
    }
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.customers?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Button onClick={() => setIsPackageDialogOpen(true)}>
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
            {packagesLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Cargando...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.map((pkg) => (
                    <TableRow key={pkg.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{pkg.tracking_number}</TableCell>
                      <TableCell>{pkg.customers?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm">{pkg.origin}</span>
                          <span className="mx-2">→</span>
                          <span className="text-sm">{pkg.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(pkg.status)}>
                          {getStatusLabel(pkg.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(pkg.created_at), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="max-w-xs truncate">{pkg.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setIsPackageDialogOpen(true)}
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
            onClick={() => setIsCustomerDialogOpen(true)}
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

      {/* Dialogs */}
      <PackageDialog 
        open={isPackageDialogOpen} 
        onOpenChange={setIsPackageDialogOpen}
        onSuccess={() => {
          refetchPackages();
          setIsPackageDialogOpen(false);
        }}
      />
      <CustomerDialog 
        open={isCustomerDialogOpen} 
        onOpenChange={setIsCustomerDialogOpen}
      />
    </div>
  );
};

export default Index;
