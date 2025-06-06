
export function PackageLabelPrintStyles() {
  return (
    <style>{`
      @media screen {
        .print-only {
          display: none;
        }
        .screen-only {
          display: block;
        }
      }
      
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body * {
          visibility: hidden;
        }
        
        .print-container, .print-container * {
          visibility: visible !important;
        }
        
        .print-container {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: 10cm !important;
          height: 15cm !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          overflow: visible !important;
        }
        
        .screen-only {
          display: none !important;
        }
        
        @page {
          size: 10cm 15cm !important;
          margin: 0 !important;
        }
        
        .label-page {
          width: 10cm !important;
          height: 15cm !important;
          margin: 0 !important;
          padding: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          position: relative !important;
          box-sizing: border-box !important;
          background: white !important;
          overflow: hidden !important;
          
          /* Forzar salto de página después de cada etiqueta */
          page-break-after: always !important;
          page-break-before: auto !important;
          page-break-inside: avoid !important;
          break-after: page !important;
          break-before: auto !important;
          break-inside: avoid !important;
        }
        
        .label-page:first-child {
          page-break-before: avoid !important;
          break-before: avoid !important;
        }
        
        .label-page:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        
        .label-content {
          width: 10cm !important;
          height: 15cm !important;
          margin: 0 !important;
          padding: 0 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          border: none !important;
          box-sizing: border-box !important;
          background: white !important;
          position: relative !important;
          overflow: visible !important;
        }
        
        [data-package-id] {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          width: 10cm !important;
          height: 15cm !important;
          box-sizing: border-box !important;
          page-break-after: always !important;
          break-after: page !important;
        }
        
        /* Asegurar que las etiquetas individuales sean visibles */
        .label-print {
          display: flex !important;
          visibility: visible !important;
          width: 10cm !important;
          height: 15cm !important;
          page-break-after: always !important;
          break-after: page !important;
          box-sizing: border-box !important;
        }
      }
    `}</style>
  );
}
