
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumber, parseFormattedNumber } from '@/utils/numberFormatter';
import { useEffect, useState } from 'react';

interface AmountToCollectSectionProps {
  currency: string;
  amountToCollect: string;
  amountToCollectFormatted: string;
  onCurrencyChange: (currency: string) => void;
  onAmountChange: (amount: string, amountFormatted: string) => void;
}

export function AmountToCollectSection({
  currency,
  amountToCollect,
  amountToCollectFormatted,
  onCurrencyChange,
  onAmountChange
}: AmountToCollectSectionProps) {
  const [isCurrencyEditable, setIsCurrencyEditable] = useState(false);
  
  useEffect(() => {
    console.log('💱 [AmountToCollectSection] Props recibidas:', {
      currency,
      amountToCollect,
      amountToCollectFormatted
    });
  }, [currency, amountToCollect, amountToCollectFormatted]);

  const handleAmountToCollectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatNumber(value);
    const raw = parseFormattedNumber(formatted);
    onAmountChange(raw, formatted);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    console.log('💱 [AmountToCollectSection] Cambio de divisa:', {
      anterior: currency,
      nueva: newCurrency,
      tipo: typeof newCurrency
    });
    
    // Validate currency before setting
    if (newCurrency === 'COP' || newCurrency === 'AWG') {
      onCurrencyChange(newCurrency);
    } else {
      console.warn('⚠️ [AmountToCollectSection] Divisa inválida, usando COP como fallback');
      onCurrencyChange('COP');
    }
    setIsCurrencyEditable(false);
  };

  const handleCurrencyClick = () => {
    setIsCurrencyEditable(true);
  };

  // Ensure currency is valid for display
  const displayCurrency = (currency === 'AWG' || currency === 'COP') ? currency : 'COP';
  
  console.log('🎯 [AmountToCollectSection] Divisa a mostrar:', {
    original: currency,
    display: displayCurrency
  });

  return (
    <div className="space-y-4">
      <Label htmlFor="amountToCollect" className="text-lg font-bold text-black">
        Valor a Cobrar
      </Label>
      
      <div className="flex gap-3">
        {!isCurrencyEditable ? (
          <div 
            onClick={handleCurrencyClick}
            className="w-28 h-12 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <span className="text-gray-600 font-medium">{displayCurrency}</span>
          </div>
        ) : (
          <Select 
            value={displayCurrency} 
            onValueChange={handleCurrencyChange}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COP">COP</SelectItem>
              <SelectItem value="AWG">AWG</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        <Input
          id="amountToCollect"
          type="text"
          value={amountToCollectFormatted}
          onChange={handleAmountToCollectChange}
          placeholder="0"
          className="flex-1"
        />
      </div>
    </div>
  );
}
