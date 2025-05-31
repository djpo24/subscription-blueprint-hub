
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
  const handleFreightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatNumber(value);
    const raw = parseFormattedNumber(formatted);
    onFreightChange(raw, formatted);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="freight">Flete (COP)</Label>
        <Input
          id="freight"
          type="text"
          value={freightFormatted}
          onChange={handleFreightChange}
          placeholder="0"
        />
      </div>

      <div>
        <Label htmlFor="weight">Peso (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => onWeightChange(e.target.value)}
          placeholder="0.0"
        />
      </div>
    </div>
  );
}
