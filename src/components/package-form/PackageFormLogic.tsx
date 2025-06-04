
import { useState } from 'react';

type Currency = 'COP' | 'AWG';

interface FormData {
  description: string;
  weight: string;
  freight: string;
  freightFormatted: string;
  amountToCollect: string;
  amountToCollectFormatted: string;
  currency: Currency;
  details: string[];
}

export function usePackageFormLogic() {
  const [formData, setFormData] = useState<FormData>({
    description: '',
    weight: '',
    freight: '',
    freightFormatted: '',
    amountToCollect: '',
    amountToCollectFormatted: '',
    currency: 'COP' as Currency,
    details: ['']
  });

  console.log('📋 [PackageFormLogic] Current form data:', formData);
  console.log('💰 [PackageFormLogic] Selected currency for amount to collect:', formData.currency);
  console.log('💰 [PackageFormLogic] Amount to collect:', formData.amountToCollect);
  console.log('🚢 [PackageFormLogic] Freight (always COP):', formData.freight);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    formData,
    updateFormData
  };
}
