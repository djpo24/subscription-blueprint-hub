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

      // IMPROVED: More robust currency handling
      let packageCurrency = 'COP'; // Default fallback
      
      if (pkg.currency) {
        // If package has a currency, validate it's in our allowed list
        if (['COP', 'AWG'].includes(pkg.currency)) {
          packageCurrency = pkg.currency;
        } else {
          // If currency exists but isn't in our list, log warning but keep it
          console.warn('⚠️ [useEditPackageForm] Unknown currency from DB:', pkg.currency, 'defaulting to COP');
        }
      }

      console.log('✅ [useEditPackageForm] Final currency to use:', packageCurrency);

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

      console.log('📋 [useEditPackageForm] Setting form data with currency:', newFormData.currency);
      setFormData(newFormData);
    }
  }, [pkg?.id]); // Remove pkg?.currency from deps to avoid unnecessary re-renders

  const getFilledDetails = () => {
    return formData.details.filter(detail => detail.trim() !== '');
  };

  const updateFormData = (updates: Partial<EditPackageFormData>) => {
    console.log('🔄 [useEditPackageForm] Updating form data:', updates);
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      console.log('✅ [useEditPackageForm] New form data after update:', newData);
      return newData;
    });
  };

  return {
    formData,
    updateFormData,
    getFilledDetails
  };
}
