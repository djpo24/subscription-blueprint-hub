
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Copy } from 'lucide-react';
import { generateCPCLCommands, sendToPrinter, CPCLLabelData } from '@/utils/cpcl';

interface Package {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  description: string;
  weight: number | null;
  customers?: {
    name: string;
    email: string;
  };
}

interface CPCLPrintButtonProps {
  package: Package;
  className?: string;
}

export function CPCLPrintButton({ package: pkg, className = '' }: CPCLPrintButtonProps) {
  const [showCommands, setShowCommands] = useState(false);
  const [cpcl, setCpcl] = useState<string>('');

  const generateCommands = () => {
    const qrData = JSON.stringify({
      id: pkg.id,
      tracking: pkg.tracking_number,
      customer: pkg.customers?.name || 'N/A',
      status: pkg.status,
      action: 'package_scan'
    });

    const labelData: CPCLLabelData = {
      tracking_number: pkg.tracking_number,
      origin: pkg.origin,
      destination: pkg.destination,
      customer_name: pkg.customers?.name || 'CLIENTE',
      description: pkg.description,
      weight: pkg.weight,
      created_at: pkg.created_at,
      qr_data: qrData
    };

    const commands = generateCPCLCommands(labelData);
    setCpcl(commands);
    setShowCommands(true);
  };

  const handlePrint = () => {
    if (!cpcl) {
      generateCommands();
    }
    sendToPrinter(cpcl);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cpcl).then(() => {
      alert('Comandos CPCL copiados al portapapeles');
    });
  };

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Button
          onClick={handlePrint}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Printer className="h-4 w-4" />
          Imprimir CPCL
        </Button>
        
        <Button
          onClick={generateCommands}
          variant="ghost"
          size="sm"
        >
          Ver comandos
        </Button>
      </div>

      {showCommands && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-sm">Comandos CPCL para JP-CC450:</h4>
            <Button
              onClick={copyToClipboard}
              size="sm"
              variant="ghost"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copiar
            </Button>
          </div>
          
          <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
            {cpcl}
          </pre>
          
          <div className="mt-2 text-xs text-gray-600">
            <p>• Conecta la impresora JP-CC450 vía USB o red</p>
            <p>• Copia estos comandos al software de la impresora</p>
            <p>• O usa el botón "Imprimir CPCL" si el navegador lo soporta</p>
          </div>
        </div>
      )}
    </div>
  );
}
