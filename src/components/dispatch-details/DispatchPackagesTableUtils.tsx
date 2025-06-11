
import { formatAmountToCollectWithCurrency, parseCurrencyString, type Currency } from '@/utils/currencyFormatter';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'en_destino':
      return 'bg-blue-100 text-blue-800';
    case 'procesado':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'Entregado';
    case 'en_destino':
      return 'En Destino';
    case 'procesado':
      return 'Procesado';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const formatCurrency = (value: number | null | undefined) => {
  if (!value) return '$0';
  return `$${value.toLocaleString('es-CO')}`;
};

export const formatAmountToCollectDisplay = (amount: number | null | undefined, currencyStr: string | null | undefined) => {
  if (!amount || amount === 0) return '---';
  
  const currency = parseCurrencyString(currencyStr);
  return formatAmountToCollectWithCurrency(amount, currency);
};

export const canDeliverPackage = (status: string) => {
  return status === 'en_destino';
};
