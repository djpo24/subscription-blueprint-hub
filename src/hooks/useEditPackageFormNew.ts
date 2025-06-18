
import { useState, useEffect } from 'react';
import { formatNumber } from '@/utils/numberFormatter';

type Currency = 'COP' | 'AWG';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  trip_id: string | null;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: Currency;
  status: string;
}

interface EditPackageFormData {
  description: string;
  weight: string;
  freight: string;
  freightFormatted: string;
  amountToCollect: string;
  amountToCollectFormatted: string;
  currency: Currency;
  details: string[];
}

export function useEditPackageFormNew(pkg: Package | null) {
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
      console.log('🔄 [useEditPackageFormNew] Initializing with package:', {
        id: pkg.id,
        tracking: pkg.tracking_number,
        currency: pkg.currency,
        amount: pkg.amount_to_collect,
        freight: pkg.freight,
        freightType: typeof pkg.freight
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

      // Ensure currency is properly typed - validate it's a valid currency
      const validCurrency: Currency = (pkg.currency === 'AWG' || pkg.currency === 'COP') ? pkg.currency : 'COP';
      
      console.log('✅ [useEditPackageFormNew] Currency processed:', {
        original: pkg.currency,
        processed: validCurrency,
        type: typeof validCurrency
      });

      // FIXED: Proper freight formatting without rounding or truncation
      const freightValue = pkg.freight?.toString() || '';
      const freightFormatted = pkg.freight ? formatNumber(pkg.freight.toString()) : '';
      
      // FIXED: Proper amount formatting without rounding or truncation  
      const amountValue = pkg.amount_to_collect?.toString() || '';
      const amountFormatted = pkg.amount_to_collect ? formatNumber(pkg.amount_to_collect.toString()) : '';

      console.log('💰 [useEditPackageFormNew] Values being set:', {
        freightOriginal: pkg.freight,
        freightValue: freightValue,
        freightFormatted: freightFormatted,
        amountOriginal: pkg.amount_to_collect,
        amountValue: amountValue,
        amountFormatted: amountFormatted
      });

      const newFormData: EditPackageFormData = {
        description: optionalDescription,
        weight: pkg.weight?.toString() || '',
        freight: freightValue,
        freightFormatted: freightFormatted,
        amountToCollect: amountValue,
        amountToCollectFormatted: amountFormatted,
        currency: validCurrency,
        details: details
      };

      console.log('📋 [useEditPackageFormNew] Final form data:', newFormData);
      setFormData(newFormData);
    }
  }, [pkg?.id]);

  const getFilledDetails = () => {
    return formData.details.filter(detail => detail.trim() !== '');
  };

  const updateFormData = (updates: Partial<EditPackageFormData>) => {
    console.log('🔄 [useEditPackageFormNew] Updating form data:', updates);
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      console.log('✅ [useEditPackageFormNew] New form state:', newData);
      return newData;
    });
  };

  return {
    formData,
    updateFormData,
    getFilledDetails
  };
}
