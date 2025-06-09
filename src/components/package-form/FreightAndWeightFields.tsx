
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatNumber, parseFormattedNumber } from '@/utils/numberFormatter';

interface FreightAndWeightFieldsProps {
  freight: string;
  freightFormatted: string;
  weight: string;
  onFreightChange: (freight: string, freightFormatted: string) => void;
  onWeightChange: (weight: string) => void;
}

export function FreightAndWeightFields({
  freight,
  freightFormatted,
  weight,
  onFreightChange,
  onWeightChange
}: FreightAndWeightFieldsProps) {
  console.log('🚢 [FreightAndWeightFields] Current freight (COP):', freight);
  console.log('⚖️ [FreightAndWeightFields] Current weight:', weight);

  const handleFreightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatNumber(value);
    const raw = parseFormattedNumber(formatted);
    console.log('🚢 [FreightAndWeightFields] Freight changing to:', raw, 'formatted:', formatted);
    onFreightChange(raw, formatted);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="freight" className="flex items-center gap-2">
          Flete 
          <span className="text-sm bg-blue-100 px-2 py-1 rounded text-blue-700 font-medium">
            COP (Peso)
          </span>
        </Label>
        <Input
          id="freight"
          type="text"
          value={freightFormatted}
          onChange={handleFreightChange}
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">
          El flete siempre se maneja en Pesos Colombianos (COP)
        </p>
      </div>

      <div>
        <Label htmlFor="weight">Peso (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => {
            console.log('⚖️ [FreightAndWeightFields] Weight changing to:', e.target.value);
            onWeightChange(e.target.value);
          }}
          placeholder="0.0"
        />
      </div>
    </div>
  );
}
