
import { Button } from '@/components/ui/button';
import { PackageLabel } from './PackageLabel';
import { LabelData } from './PackageLabelGenerator';
import { FileText, Printer } from 'lucide-react';

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

interface PackageLabelPreviewProps {
  packages: Package[];
  labelsData: Map<string, LabelData>;
  onPrint: () => void;
  isPDFMode?: boolean;
}

export function PackageLabelPreview({ packages, labelsData, onPrint, isPDFMode = false }: PackageLabelPreviewProps) {
  return (
    <div className="screen-only mb-4 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        {isPDFMode ? <FileText className="h-5 w-5" /> : <Printer className="h-5 w-5" />}
        Vista Previa - {packages.length} Etiquetas
      </h3>
      <div className="text-sm text-gray-600 mb-4">
        {isPDFMode ? (
          <>
            Se generará un PDF con {packages.length} etiqueta{packages.length !== 1 ? 's' : ''} 
            (cada etiqueta en su propia página tamaño carta)
          </>
        ) : (
          <>
            Se imprimirán {packages.length} etiqueta{packages.length !== 1 ? 's' : ''} 
            en páginas separadas tamaño carta (cada etiqueta en su propia hoja)
          </>
        )}
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {packages.map((pkg, index) => {
          const labelData = labelsData.get(pkg.id);
          return (
            <div key={pkg.id} className="border border-gray-300 bg-white p-4">
              <div className="text-xs text-gray-500 mb-2">Página {index + 1} de {packages.length} - {pkg.tracking_number}</div>
              <div className="text-xs text-gray-400 mb-2">Hoja tamaño carta - Etiqueta centrada</div>
              <div className="flex justify-center bg-gray-50 p-4">
                <div style={{ transform: 'scale(0.3)', transformOrigin: 'top center' }}>
                  <PackageLabel package={pkg} labelData={labelData} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        onClick={onPrint}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
      >
        {isPDFMode ? <FileText className="h-4 w-4" /> : <Printer className="h-4 w-4" />}
        {isPDFMode ? 'Generar e Imprimir PDF' : 'Imprimir'} {packages.length} Etiqueta{packages.length !== 1 ? 's' : ''} (Tamaño Carta)
      </Button>
    </div>
  );
}
