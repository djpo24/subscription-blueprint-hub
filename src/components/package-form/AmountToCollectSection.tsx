
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
    console.log('💱 [AmountToCollectSection] Component updated with currency:', currency);
    console.log('💰 [AmountToCollectSection] Amount:', amountToCollect);
    console.log('💰 [AmountToCollectSection] Formatted amount:', amountToCollectFormatted);
  }, [currency, amountToCollect, amountToCollectFormatted]);

  const handleAmountToCollectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatNumber(value);
    const raw = parseFormattedNumber(formatted);
    console.log('💰 [AmountToCollectSection] Amount changing from', value, 'to formatted:', formatted, 'raw:', raw);
    onAmountChange(raw, formatted);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    console.log('💱 [AmountToCollectSection] Currency change from', currency, 'to', newCurrency);
    onCurrencyChange(newCurrency);
    setIsCurrencyEditable(false);
  };

  const handleCurrencyClick = () => {
    setIsCurrencyEditable(true);
  };

  // IMPROVED: Validate currency but preserve original value if valid
  const displayCurrency = (() => {
    if (!currency) {
      console.warn('⚠️ [AmountToCollectSection] No currency provided, using COP');
      return 'COP';
    }
    
    if (['COP', 'AWG'].includes(currency)) {
      return currency;
    }
    
    console.warn('⚠️ [AmountToCollectSection] Invalid currency:', currency, 'using COP');
    return 'COP';
  })();
  
  console.log('🎯 [AmountToCollectSection] Displaying currency:', displayCurrency);
  console.log('🎯 [AmountToCollectSection] Original currency prop:', currency);
  console.log('🔍 [AmountToCollectSection] Is currency editable:', isCurrencyEditable);

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
              <SelectValue placeholder="Divisa" />
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

      {/* Debug info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
        <div>🎯 <strong>Prop currency:</strong> {currency || 'undefined'}</div>
        <div>🖥️ <strong>Display currency:</strong> {displayCurrency}</div>
        <div>🔧 <strong>Editable:</strong> {isCurrencyEditable ? 'Sí' : 'No'}</div>
        <div>💰 <strong>Monto raw:</strong> {amountToCollect || '0'}</div>
        <div>💰 <strong>Monto formateado:</strong> {amountToCollectFormatted || '0'}</div>
      </div>
    </div>
  );
}
