
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
  currency?: string; // Add currency to the Package interface
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

      // Use the package currency from database, fallback to COP if not available
      const packageCurrency = pkg.currency || 'COP';
      console.log('💱 [useEditPackageForm] Setting currency to:', packageCurrency);

      setFormData({
        description: optionalDescription,
        weight: pkg.weight?.toString() || '',
        freight: pkg.freight?.toString() || '',
        freightFormatted: pkg.freight ? `$${pkg.freight.toLocaleString()}` : '',
        amountToCollect: pkg.amount_to_collect?.toString() || '',
        amountToCollectFormatted: pkg.amount_to_collect ? `$${pkg.amount_to_collect.toLocaleString()}` : '',
        currency: packageCurrency, // Use the actual currency from the package
        details: details
      });

      console.log('✅ [useEditPackageForm] Form data initialized with currency:', packageCurrency);
    }
  }, [pkg]);

  const getFilledDetails = () => {
    return formData.details.filter(detail => detail.trim() !== '');
  };

  const updateFormData = (updates: Partial<EditPackageFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    formData,
    updateFormData,
    getFilledDetails
  };
}
