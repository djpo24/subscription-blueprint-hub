
import { ProductDetailsInput } from './package-form/ProductDetailsInput';
import { FreightAndWeightFields } from './package-form/FreightAndWeightFields';
import { AmountToCollectSectionNew } from './package-form/AmountToCollectSectionNew';
import { OptionalDescriptionField } from './package-form/OptionalDescriptionField';
import { EditPackageFormActions } from './edit-package-form/EditPackageFormActions';
import { useEditPackageFormNew } from '@/hooks/useEditPackageFormNew';
import { useEditPackageFormSubmissionNew } from '@/hooks/useEditPackageFormSubmissionNew';

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

interface EditPackageFormNewProps {
  package: Package;
  customerId: string;
  tripId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditPackageFormNew({
  package: pkg,
  customerId,
  tripId,
  onSuccess,
  onCancel
}: EditPackageFormNewProps) {
  const { formData, updateFormData, getFilledDetails } = useEditPackageFormNew(pkg);
  const { handleSubmit, isLoading } = useEditPackageFormSubmissionNew({
    package: pkg,
    customerId,
    tripId,
    formData,
    getFilledDetails,
    onSuccess
  });

  console.log('🔍 [EditPackageFormNew] Current state:', {
    packageCurrency: pkg.currency,
    formCurrency: formData.currency,
    trackingNumber: pkg.tracking_number,
    formCurrencyType: typeof formData.currency
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProductDetailsInput
        details={formData.details}
        onChange={(details) => updateFormData({ details })}
      />

      <FreightAndWeightFields
        freight={formData.freight}
        freightFormatted={formData.freightFormatted}
        weight={formData.weight}
        onFreightChange={(freight, freightFormatted) =>
          updateFormData({ freight, freightFormatted })
        }
        onWeightChange={(weight) =>
          updateFormData({ weight })
        }
      />

      <AmountToCollectSectionNew
        currency={formData.currency}
        amountToCollect={formData.amountToCollect}
        amountToCollectFormatted={formData.amountToCollectFormatted}
        onCurrencyChange={(currency) => {
          console.log('💱 [EditPackageFormNew] Currency change detected:', {
            from: formData.currency,
            to: currency,
            package: pkg.tracking_number,
            currencyType: typeof currency
          });
          updateFormData({ currency });
        }}
        onAmountChange={(amountToCollect, amountToCollectFormatted) =>
          updateFormData({ amountToCollect, amountToCollectFormatted })
        }
      />

      <OptionalDescriptionField
        description={formData.description}
        onChange={(description) =>
          updateFormData({ description })
        }
      />

      <EditPackageFormActions
        package={pkg}
        isLoading={isLoading}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </form>
  );
}
