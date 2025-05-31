
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProductDetailsInputProps {
  details: string[];
  onChange: (details: string[]) => void;
}

export function ProductDetailsInput({ details, onChange }: ProductDetailsInputProps) {
  const handleDetailChange = (index: number, value: string) => {
    const newDetails = [...details];
    newDetails[index] = value;
    onChange(newDetails);
  };

  const handleDetailBlur = (index: number) => {
    const currentDetail = details[index];
    if (currentDetail.trim() && index === details.length - 1 && details.length < 1000) {
      // Add new empty field if current is the last one and has content
      onChange([...details, '']);
    }
  };

  const handleDetailKeyPress = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentDetail = details[index];
      if (currentDetail.trim() && index === details.length - 1 && details.length < 1000) {
        onChange([...details, '']);
        // Focus next input after a short delay
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-detail-index="${index + 1}"]`) as HTMLInputElement;
          if (nextInput) nextInput.focus();
        }, 100);
      }
    }
  };

  return (
    <div>
      <Label>Detalles de productos *</Label>
      <div className="space-y-2 mt-2">
        {details.map((detail, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              data-detail-index={index}
              value={detail}
              onChange={(e) => handleDetailChange(index, e.target.value)}
              onBlur={() => handleDetailBlur(index)}
              onKeyPress={(e) => handleDetailKeyPress(index, e)}
              placeholder={`Producto ${index + 1}${index === 0 ? ' (requerido)' : ' (opcional)'}`}
              required={index === 0}
            />
            <span className="text-sm text-gray-500 min-w-[60px]">
              {index + 1}/1000
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Presiona Enter o haz clic fuera del campo para agregar otro producto (máximo 1000)
      </p>
    </div>
  );
}
