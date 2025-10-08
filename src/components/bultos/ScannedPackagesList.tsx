import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ScannedPackagesListProps {
  packages: any[];
  onRemove: (packageId: string) => void;
}

export function ScannedPackagesList({ packages, onRemove }: ScannedPackagesListProps) {
  if (packages.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay paquetes escaneados</p>
            <p className="text-sm mt-1">Escanea códigos de barras para agregarlos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Paquetes Escaneados ({packages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {packages.map((pkg) => (
            <div 
              key={pkg.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-mono font-medium">{pkg.tracking_number}</p>
                  {pkg.isMoving && (
                    <Badge variant="outline" className="text-xs">
                      Mover
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {pkg.customers?.name}
                </p>
                {pkg.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {pkg.description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(pkg.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
