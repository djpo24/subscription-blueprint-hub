import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useDeletedPackages } from '@/hooks/useDeletedPackages';
import { RotateCcw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export function DeletedPackagesPanel() {
  const { deletedPackages, isLoading, error, restorePackage, isRestoring } = useDeletedPackages();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  console.log('🗑️ [DeletedPackagesPanel] Rendering with:', { 
    deletedPackagesCount: deletedPackages?.length, 
    isLoading, 
    hasError: !!error 
  });

  const handleRestoreClick = (packageId: string) => {
    setSelectedPackageId(packageId);
    setShowRestoreDialog(true);
  };

  const handleConfirmRestore = () => {
    if (selectedPackageId) {
      restorePackage(selectedPackageId);
      setShowRestoreDialog(false);
      setSelectedPackageId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Paquetes Eliminados</CardTitle>
          <CardDescription>
            Cargando paquetes eliminados...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Paquetes Eliminados</CardTitle>
          <CardDescription>
            Error al cargar paquetes eliminados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            {error.message || 'Ocurrió un error al cargar los paquetes eliminados'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Paquetes Eliminados</CardTitle>
          <CardDescription>
            Administra los paquetes que han sido eliminados del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deletedPackages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay paquetes eliminados
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Eliminado</TableHead>
                    <TableHead>Eliminado por</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedPackages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-mono text-sm">
                        {pkg.tracking_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pkg.customer_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {pkg.customer_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {pkg.description}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {pkg.origin} → {pkg.destination}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {pkg.currency} {pkg.amount_to_collect}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(pkg.deleted_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {pkg.deleted_by_name || 'Desconocido'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreClick(pkg.id)}
                          disabled={isRestoring}
                          className="flex items-center gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restaurar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restaurar paquete?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción restaurará el paquete y volverá a estar visible en el sistema.
              El paquete recuperará su estado anterior a la eliminación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestore}>
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
