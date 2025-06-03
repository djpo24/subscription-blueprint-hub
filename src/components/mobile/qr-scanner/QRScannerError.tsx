
import { Card, CardContent } from '@/components/ui/card';

interface QRScannerErrorProps {
  error: string;
}

export function QRScannerError({ error }: QRScannerErrorProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-4">
        <p className="text-red-700 text-sm">{error}</p>
      </CardContent>
    </Card>
  );
}
