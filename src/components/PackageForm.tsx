
import { Button } from '@/components/ui/button';
import { ProductDetailsInput } from './package-form/ProductDetailsInput';
import { FreightAndWeightFields } from './package-form/FreightAndWeightFields';
import { AmountToCollectSection } from './package-form/AmountToCollectSection';
import { OptionalDescriptionField } from './package-form/OptionalDescriptionField';
import { usePackageFormLogic } from './package-form/PackageFormLogic';
import { usePackageFormValidation } from './package-form/PackageFormValidation';
import { usePackageFormSubmission } from './package-form/PackageFormSubmission';

interface PackageFormProps {
  customerId: string;
  tripId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PackageForm({
  customerId,
  tripId,
  onSuccess,
  onCancel
}: PackageFormProps) {
  const { formData, updateFormData } = usePackageFormLogic();
  const { validateForm, getFilledDetails } = usePackageFormValidation();
  const { isLoading, submitPackage } = usePackageFormSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(customerId, tripId, formData)) {
      return;
    }

    const filledDetails = getFilledDetails(formData.details);
    const success = await submitPackage(customerId, tripId!, formData, filledDetails);
    
    if (success) {
      onSuccess();
    }
  };

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
          console.log('💱 [PackageForm] Currency changed to:', currency);
          updateFormData({ currency });
        }}
        onAmountChange={(amountToCollect, amountToCollectFormatted) => {
          console.log('💰 [PackageForm] Amount changed to:', amountToCollect);
          updateFormData({ amountToCollect, amountToCollectFormatted });
        }}
      />

      <OptionalDescriptionField
        description={formData.description}
        onChange={(description) =>
          updateFormData({ description })
        }
      />

      <div className="w-full">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Creando...' : 'Crear Encomienda'}
        </Button>
      </div>
    </form>
  );
}
