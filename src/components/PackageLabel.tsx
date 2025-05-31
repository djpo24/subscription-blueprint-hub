
import { useQRCode } from './PackageLabelQRCode';
import { PackageLabelPreview } from './PackageLabelPreview';
import { PackageLabelPrint } from './PackageLabelPrint';
import { PackageLabelStyles } from './PackageLabelStyles';

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

interface PackageLabelProps {
  package: Package;
}

export function PackageLabel({ package: pkg }: PackageLabelProps) {
  const { qrCodeDataUrl } = useQRCode(pkg);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="package-label-container">
      <PackageLabelPreview 
        package={pkg} 
        qrCodeDataUrl={qrCodeDataUrl} 
        onPrint={handlePrint}
      />
      
      <PackageLabelPrint 
        package={pkg} 
        qrCodeDataUrl={qrCodeDataUrl}
      />
      
      <PackageLabelStyles />
    </div>
  );
}
