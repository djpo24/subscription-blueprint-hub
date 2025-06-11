
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'procesado':
      return 'bg-orange-100 text-orange-800';
    case 'despachado':
      return 'bg-purple-100 text-purple-800';
    case 'en_transito':
      return 'bg-blue-100 text-blue-800';
    case 'llegado':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'procesado':
      return 'Procesado';
    case 'despachado':
      return 'Despachado';
    case 'en_transito':
      return 'En Tránsito';
    case 'llegado':
      return 'Llegado';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const formatCurrency = (value: number | null | undefined) => {
  if (!value) return '$0';
  return `$${value.toLocaleString('es-CO')}`;
};

export const formatWeight = (weight: number | null | undefined) => {
  if (!weight) return '0';
  // Convertir a número y eliminar decimales innecesarios
  const numWeight = Number(weight);
  return numWeight % 1 === 0 ? numWeight.toString() : numWeight.toFixed(1);
};
