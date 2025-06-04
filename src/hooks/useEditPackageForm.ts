
import { useState, useEffect } from 'react';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  trip_id: string | null;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency?: string;
  status: string;
}

interface EditPackageFormData {
  description: string;
  weight: string;
  freight: string;
  freightFormatted: string;
  amountToCollect: string;
  amountToCollectFormatted: string;
  currency: string;
  details: string[];
}

export function useEditPackageForm(pkg: Package | null) {
  const [formData, setFormData] = useState<EditPackageFormData>({
    description: '',
    weight: '',
    freight: '',
    freightFormatted: '',
    amountToCollect: '',
    amountToCollectFormatted: '',
    currency: 'COP',
    details: ['']
  });

  useEffect(() => {
    if (pkg) {
      console.log('🔄 [useEditPackageForm] Inicializando con paquete:', {
        id: pkg.id,
        tracking: pkg.tracking_number,
        currency: pkg.currency,
        amount: pkg.amount_to_collect
      });
      
      // Parse existing description to extract details and optional description
      const description = pkg.description || '';
      let optionalDescription = '';
      let details = [''];

      // Try to split description if it contains " - " (separator from create form)
      if (description.includes(' - ')) {
        const parts = description.split(' - ');
        optionalDescription = parts[0];
        const detailsString = parts.slice(1).join(' - ');
        details = detailsString.split(', ').filter(detail => detail.trim());
      } else {
        // If no separator, treat as details only
        details = description.split(', ').filter(detail => detail.trim());
      }

      // Ensure at least one empty detail for input
      if (details.length === 0) {
        details = [''];
      } else if (details[details.length - 1] !== '') {
        details.push('');
      }

      // FIXED: Ensure currency is properly validated and set
      let packageCurrency = 'COP'; // Default fallback
      if (pkg.currency === 'AWG' || pkg.currency === 'COP') {
        packageCurrency = pkg.currency;
      }
      
      console.log('✅ [useEditPackageForm] Divisa procesada:', {
        original: pkg.currency,
        processed: packageCurrency
      });

      const newFormData = {
        description: optionalDescription,
        weight: pkg.weight?.toString() || '',
        freight: pkg.freight?.toString() || '',
        freightFormatted: pkg.freight ? `$${pkg.freight.toLocaleString()}` : '',
        amountToCollect: pkg.amount_to_collect?.toString() || '',
        amountToCollectFormatted: pkg.amount_to_collect ? `$${pkg.amount_to_collect.toLocaleString()}` : '',
        currency: packageCurrency,
        details: details
      };

      console.log('📋 [useEditPackageForm] Form data final:', newFormData);
      setFormData(newFormData);
    }
  }, [pkg?.id, pkg?.currency]); // Added pkg?.currency to dependencies

  const getFilledDetails = () => {
    return formData.details.filter(detail => detail.trim() !== '');
  };

  const updateFormData = (updates: Partial<EditPackageFormData>) => {
    console.log('🔄 [useEditPackageForm] Actualizando:', updates);
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      console.log('✅ [useEditPackageForm] Nuevo estado:', newData);
      return newData;
    });
  };

  return {
    formData,
    updateFormData,
    getFilledDetails
  };
}
