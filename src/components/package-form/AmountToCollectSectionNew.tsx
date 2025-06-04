
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumber, parseFormattedNumber } from '@/utils/numberFormatter';
import { useState } from 'react';

type Currency = 'COP' | 'AWG';

interface AmountToCollectSectionNewProps {
  currency: Currency;
  amountToCollect: string;
  amountToCollectFormatted: string;
  onCurrencyChange: (currency: Currency) => void;
  onAmountChange: (amount: string, amountFormatted: string) => void;
}

export function AmountToCollectSectionNew({
  currency,
  amountToCollect,
  amountToCollectFormatted,
  onCurrencyChange,
  onAmountChange
}: AmountToCollectSectionNewProps) {
  const [isCurrencyEditable, setIsCurrencyEditable] = useState(false);
  
  console.log('💱 [AmountToCollectSectionNew] Current props:', {
    currency,
    amountToCollect,
    amountToCollectFormatted,
    currencyType: typeof currency
  });

  const handleAmountToCollectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatNumber(value);
    const raw = parseFormattedNumber(formatted);
    onAmountChange(raw, formatted);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    console.log('💱 [AmountToCollectSectionNew] Currency change:', {
      from: currency,
      to: newCurrency,
      type: typeof newCurrency
    });
    
    // Strict type validation - only allow COP or AWG
    const validCurrency: Currency = newCurrency === 'AWG' ? 'AWG' : 'COP';
    console.log('✅ [AmountToCollectSectionNew] Valid currency:', validCurrency);
    
    onCurrencyChange(validCurrency);
    setIsCurrencyEditable(false);
  };

  const handleCurrencyClick = () => {
    setIsCurrencyEditable(true);
  };

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
            <span className="text-gray-600 font-medium">{currency}</span>
          </div>
        ) : (
          <Select 
            value={currency} 
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
