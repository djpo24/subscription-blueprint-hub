
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
      console.log('🔄 [useEditPackageForm] Initializing with package:', pkg);
      console.log('💱 [useEditPackageForm] Package currency from DB:', pkg.currency);
      
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

      // CRÍTICO: Usar la moneda del paquete primero, luego AWG como fallback
      const packageCurrency = pkg.currency || 'AWG';
      console.log('💱 [useEditPackageForm] Setting currency to:', packageCurrency);
      console.log('💱 [useEditPackageForm] Raw package data:', {
        id: pkg.id,
        currency: pkg.currency,
        amount_to_collect: pkg.amount_to_collect
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

      console.log('✅ [useEditPackageForm] Setting form data:', newFormData);
      setFormData(newFormData);
    }
  }, [pkg?.id, pkg?.currency]); // Asegurar que se ejecute cuando cambie la moneda

  const getFilledDetails = () => {
    return formData.details.filter(detail => detail.trim() !== '');
  };

  const updateFormData = (updates: Partial<EditPackageFormData>) => {
    console.log('🔄 [useEditPackageForm] Updating form data:', updates);
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      console.log('🔄 [useEditPackageForm] New form data:', newData);
      return newData;
    });
  };

  return {
    formData,
    updateFormData,
    getFilledDetails
  };
}
