import { useState } from 'react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { usePackagesByDate } from '@/hooks/usePackagesByDate';
import { useDispatchRelations } from '@/hooks/useDispatchRelations';

export function usePackagesByDateView(selectedDate: Date) {
  const { data: tripsData = [], isLoading } = usePackagesByDate(selectedDate);
  const { data: dispatches = [] } = useDispatchRelations(selectedDate);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const [createDispatchDialogOpen, setCreateDispatchDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Transform the data to match the expected Trip interface
  const trips = tripsData.map(trip => ({
    id: trip.id,
    origin: trip.origin,
    destination: trip.destination,
    flight_number: trip.flight_number,
    packages: trip.packages.map(pkg => ({
      id: pkg.id,
      tracking_number: pkg.tracking_number,
      customer_id: pkg.customer_id,
      description: pkg.description,
      weight: pkg.weight,
      freight: pkg.freight,
      amount_to_collect: pkg.amount_to_collect,
      currency: pkg.currency,
      status: pkg.status,
      customers: pkg.customers || undefined
    }))
  }));

  const handlePackageClick = (pkg: any, tripId: string) => {
    console.log('🎯 [usePackagesByDateView] Package clicked with trip ID:', {
      packageId: pkg.id,
      tripId: tripId,
      packageTripId: pkg.trip_id
    });
    
    setSelectedPackage(pkg);
    setSelectedTripId(tripId);
    setEditDialogOpen(true);
  };

  const handleOpenChat = (customerId: string, customerName?: string) => {
    setSelectedCustomerId(customerId);
    setSelectedCustomerName(customerName || 'Cliente');
    setChatDialogOpen(true);
  };

  const handlePackageEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedPackage(null);
    setSelectedTripId('');
    
    // Invalidar las consultas para actualizar la vista
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    queryClient.invalidateQueries({ queryKey: ['packages-by-date', formattedDate] });
    queryClient.invalidateQueries({ queryKey: ['packages'] });
    queryClient.invalidateQueries({ queryKey: ['trips'] });
  };

  const handleCreateDispatch = () => {
    console.log('Create dispatch for date:', selectedDate);
    setCreateDispatchDialogOpen(true);
  };

  const handleCreateDispatchSuccess = () => {
    setCreateDispatchDialogOpen(false);
    
    // Invalidar las consultas para actualizar la vista
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    queryClient.invalidateQueries({ queryKey: ['packages-by-date', formattedDate] });
    queryClient.invalidateQueries({ queryKey: ['dispatch-relations', formattedDate] });
    queryClient.invalidateQueries({ queryKey: ['packages'] });
    queryClient.invalidateQueries({ queryKey: ['trips'] });
  };

  // Calculate totals correctly - el flete siempre en COP
  const totalPackages = trips.reduce((acc, trip) => acc + trip.packages.length, 0);
  const totalWeight = trips.reduce((acc, trip) => 
    acc + trip.packages.reduce((packAcc, pkg) => packAcc + (pkg.weight || 0), 0), 0
  );
  
  // El flete siempre se suma en COP, sin importar la moneda del paquete
  const totalFreight = trips.reduce((acc, trip) => 
    acc + trip.packages.reduce((packAcc, pkg) => packAcc + (pkg.freight || 0), 0), 0
  );
  
  // Los montos a cobrar se suman independientemente de la moneda (para el resumen general)
  const totalAmountToCollect = trips.reduce((acc, trip) => 
    acc + trip.packages.reduce((packAcc, pkg) => packAcc + (pkg.amount_to_collect || 0), 0), 0
  );

  return {
    trips,
    dispatches,
    isLoading,
    selectedPackage,
    selectedTripId,
    editDialogOpen,
    setEditDialogOpen,
    chatDialogOpen,
    setChatDialogOpen,
    selectedCustomerId,
    selectedCustomerName,
    createDispatchDialogOpen,
    setCreateDispatchDialogOpen,
    totalPackages,
    totalWeight,
    totalFreight,
    totalAmountToCollect,
    handlePackageClick,
    handleOpenChat,
    handlePackageEditSuccess,
    handleCreateDispatch,
    handleCreateDispatchSuccess,
    queryClient
  };
}
