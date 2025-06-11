
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    case 'en_transito':
      return 'bg-blue-100 text-blue-800';
    case 'llegado':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'en_transito':
      return 'En Tránsito';
    case 'llegado':
      return 'Llegado';
    case 'completed':
      return 'Completado';
    case 'in_progress':
      return 'En Progreso';
    default:
      return status;
  }
};

export const formatCurrency = (amount: number | null | undefined) => {
  if (!amount || amount === 0) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatWeight = (weight: number | null | undefined) => {
  if (!weight || weight === 0) return '0';
  return weight.toFixed(1);
};
