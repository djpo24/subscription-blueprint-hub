
import { ProductDetailsInput } from './package-form/ProductDetailsInput';
import { FreightAndWeightFields } from './package-form/FreightAndWeightFields';
import { AmountToCollectSection } from './package-form/AmountToCollectSection';
import { OptionalDescriptionField } from './package-form/OptionalDescriptionField';
import { EditPackageFormActions } from './edit-package-form/EditPackageFormActions';
import { useEditPackageForm } from '@/hooks/useEditPackageForm';
import { useEditPackageFormSubmission } from './edit-package-form/EditPackageFormSubmission';

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

interface EditPackageFormProps {
  package: Package;
  customerId: string;
  tripId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditPackageForm({
  package: pkg,
  customerId,
  tripId,
  onSuccess,
  onCancel
}: EditPackageFormProps) {
  const { formData, updateFormData, getFilledDetails } = useEditPackageForm(pkg);
  const { handleSubmit, isLoading } = useEditPackageFormSubmission({
    package: pkg,
    customerId,
    tripId,
    formData,
    getFilledDetails,
    onSuccess
  });

  console.log('🔍 [EditPackageForm] Estado actual:', {
    packageCurrency: pkg.currency,
    formCurrency: formData.currency,
    trackingNumber: pkg.tracking_number
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

      <AmountToCollectSection
        currency={formData.currency}
        amountToCollect={formData.amountToCollect}
        amountToCollectFormatted={formData.amountToCollectFormatted}
        onCurrencyChange={(currency) => {
          console.log('💱 [EditPackageForm] Cambio de divisa detectado:', {
            from: formData.currency,
            to: currency,
            package: pkg.tracking_number
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
