
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
    console.log('💱 [AmountToCollectSection] Componente actualizado con divisa:', currency);
    console.log('💰 [AmountToCollectSection] Cantidad:', amountToCollect);
    console.log('💰 [AmountToCollectSection] Cantidad formateada:', amountToCollectFormatted);
  }, [currency, amountToCollect, amountToCollectFormatted]);

  const handleAmountToCollectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatNumber(value);
    const raw = parseFormattedNumber(formatted);
    console.log('💰 [AmountToCollectSection] Cantidad cambiando de', value, 'a formateado:', formatted, 'raw:', raw);
    onAmountChange(raw, formatted);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    console.log('💱 [AmountToCollectSection] Cambio de divisa de', currency, 'a', newCurrency);
    onCurrencyChange(newCurrency);
    setIsCurrencyEditable(false);
  };

  const handleCurrencyClick = () => {
    setIsCurrencyEditable(true);
  };

  // Validar que la divisa sea una opción válida
  const validCurrency = ['COP', 'AWG'].includes(currency) ? currency : 'COP';
  
  console.log('🎯 [AmountToCollectSection] Mostrando divisa:', validCurrency);
  console.log('🎯 [AmountToCollectSection] Divisa prop original:', currency);
  console.log('🔍 [AmountToCollectSection] ¿Es divisa editable?:', isCurrencyEditable);

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
            <span className="text-gray-600 font-medium">{validCurrency}</span>
          </div>
        ) : (
          <Select 
            value={validCurrency} 
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

      {/* Debug info - remover en producción */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
        <div>🎯 <strong>Prop divisa:</strong> {currency || 'undefined'}</div>
        <div>🖥️ <strong>Divisa mostrada:</strong> {validCurrency}</div>
        <div>🔧 <strong>Editable:</strong> {isCurrencyEditable ? 'Sí' : 'No'}</div>
        <div>💰 <strong>Monto raw:</strong> {amountToCollect || '0'}</div>
        <div>💰 <strong>Monto formateado:</strong> {amountToCollectFormatted || '0'}</div>
      </div>
    </div>
  );
}
