
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatNumber, parseFormattedNumber } from '@/utils/numberFormatter';
import { useEffect } from 'react';

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
  };

  // Asegurar que currency siempre sea un string válido
  const safeCurrency = currency || 'COP';
  
  console.log('🔍 [AmountToCollectSection] Rendering with safe currency:', safeCurrency);

  return (
    <div className="space-y-4">
      <Label htmlFor="amountToCollect" className="text-lg font-bold text-black">
        Valor a Cobrar
      </Label>
      
      <div className="flex gap-3">
        <Select 
          value={safeCurrency} 
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
        <Input
          id="amountToCollect"
          type="text"
          value={amountToCollectFormatted}
          onChange={handleAmountToCollectChange}
          placeholder="0"
          className="flex-1"
        />
      </div>

      {/* Debug info simplificado */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
        <div>🎯 <strong>Divisa actual:</strong> {safeCurrency}</div>
        <div>💰 <strong>Monto raw:</strong> {amountToCollect || '0'}</div>
        <div>💰 <strong>Monto formateado:</strong> {amountToCollectFormatted || '0'}</div>
      </div>
    </div>
  );
}
