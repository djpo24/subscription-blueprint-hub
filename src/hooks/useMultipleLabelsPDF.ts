
import { useCallback } from 'react';
import { PDFLabelService } from '@/services/pdfLabelService';
import { useMarkPackageAsPrinted } from './useMarkPackageAsPrinted';

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
  const markPackageAsPrinted = useMarkPackageAsPrinted();

  const generatePDFFromLabels = useCallback(async (
    packages: Package[], 
    labelsData: Map<string, LabelData>
  ) => {
    return await PDFLabelService.generatePDF(packages, labelsData);
  }, []);

  const printMultipleLabelsAsPDF = useCallback(async (
    packages: Package[], 
    labelsData: Map<string, LabelData>
  ) => {
    return await PDFLabelService.printPDF(packages, labelsData, (packageIds) => {
      // Marcar paquetes como impresos después de la impresión exitosa
      console.log('🏷️ Marcando paquetes como impresos después de la impresión:', packageIds);
      markPackageAsPrinted.mutate({ packageIds });
    });
  }, [markPackageAsPrinted]);

  return {
    generatePDFFromLabels,
    printMultipleLabelsAsPDF
  };
}
