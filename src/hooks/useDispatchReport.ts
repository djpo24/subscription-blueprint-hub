
import { useState } from 'react';
import { DispatchReportPDFService } from '@/services/pdf/DispatchReportPDFService';
import type { PackageInDispatch } from '@/types/dispatch';
import { toast } from 'sonner';

export function useDispatchReport() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async (packages: PackageInDispatch[]) => {
    if (packages.length === 0) {
      toast.error('No hay encomiendas para generar el reporte');
      return;
    }

    setIsGenerating(true);
    
    try {
      await DispatchReportPDFService.printDispatchReport(packages);
      toast.success(`Reporte generado con ${packages.length} encomiendas`);
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateReport,
    isGenerating
  };
}
