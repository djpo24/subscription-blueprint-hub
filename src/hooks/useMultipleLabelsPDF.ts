
import { useCallback } from 'react';
import { PDFLabelService } from '@/services/pdfLabelService';

interface Package {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  description: string;
  weight: number | null;
  amount_to_collect?: number | null;
  currency?: string;
  customers?: {
    name: string;
    email: string;
  };
}

interface LabelData {
  qrCodeDataUrl: string;
  barcodeDataUrl: string;
}

export function useMultipleLabelsPDF() {
  const generatePDFFromLabels = useCallback(async (
    packages: Package[], 
    labelsData: Map<string, LabelData>
  ) => {
    return await PDFLabelService.generatePDF(packages, labelsData);
  }, []);

  const printMultipleLabelsAsPDF = useCallback(async (
    packages: Package[], 
    labelsData: Map<string, LabelData>,
    isReprint: boolean = false
  ) => {
    return await PDFLabelService.printPDF(packages, labelsData, isReprint ? undefined : (packageIds) => {
      // Solo marcar paquetes como impresos si NO es una reimpresión
      console.log('🏷️ Marcando paquetes como impresos después de la impresión inicial:', packageIds);
      // Aquí se llamaría a markPackageAsPrinted, pero solo para impresiones iniciales
      // Como estamos eliminando esta funcionalidad para evitar el bug, no hacemos nada
    });
  }, []);

  return {
    generatePDFFromLabels,
    printMultipleLabelsAsPDF
  };
}
