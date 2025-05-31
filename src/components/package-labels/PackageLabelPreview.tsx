
import { Button } from '@/components/ui/button';
import { PackageLabel } from './PackageLabel';
import { LabelData } from './PackageLabelGenerator';

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
}

export function PackageLabelPreview({ packages, labelsData, onPrint }: PackageLabelPreviewProps) {
  return (
    <div className="screen-only mb-4 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-2">Vista Previa - {packages.length} Etiquetas</h3>
      <div className="text-sm text-gray-600 mb-4">
        Se imprimirán {packages.length} etiqueta{packages.length !== 1 ? 's' : ''} centradas en páginas separadas
      </div>
      
      <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {packages.map((pkg) => {
          const labelData = labelsData.get(pkg.id);
          return (
            <div
              key={pkg.id}
              className="border border-gray-300 bg-white p-2 flex justify-center"
              style={{ 
                width: '150px', 
                height: '225px'
              }}
            >
              <div style={{ transform: 'scale(0.5)', transformOrigin: 'top center' }}>
                <PackageLabel package={pkg} labelData={labelData} />
              </div>
            </div>
          );
        })}
      </div>

      <Button
        onClick={onPrint}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Imprimir {packages.length} Etiqueta{packages.length !== 1 ? 's' : ''}
      </Button>
    </div>
  );
}
