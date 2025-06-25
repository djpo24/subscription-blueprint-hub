
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
  const { mutateAsync: markPackageAsPrinted } = useMarkPackageAsPrinted();

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
    console.log('🖨️ [useMultipleLabelsPDF] Iniciando impresión - Es reimpresión:', isReprint);
    
    try {
      // Generar e imprimir el PDF
      await PDFLabelService.printPDF(packages, labelsData);
      
      // Solo marcar como impresos si NO es una reimpresión
      if (!isReprint) {
        const packageIds = packages.map(pkg => pkg.id);
        console.log('🏷️ [useMultipleLabelsPDF] Marcando paquetes como impresos:', packageIds);
        
        await markPackageAsPrinted({ packageIds });
        console.log('✅ [useMultipleLabelsPDF] Paquetes marcados como impresos exitosamente');
      } else {
        console.log('🔄 [useMultipleLabelsPDF] Saltando marcado como impreso porque es una reimpresión');
      }
      
    } catch (error) {
      console.error('❌ [useMultipleLabelsPDF] Error en el proceso de impresión:', error);
      throw error;
    }
  }, [markPackageAsPrinted]);

  return {
    generatePDFFromLabels,
    printMultipleLabelsAsPDF
  };
}
