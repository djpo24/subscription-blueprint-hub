
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
          position: static !important;
          display: block !important;
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          overflow: visible !important;
        }
        
        .screen-only {
          display: none !important;
        }
        
        @page {
          size: letter;
          margin: 0.5in;
        }
        
        .label-page {
          width: 100% !important;
          height: 100vh !important;
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
          
          /* Asegurar que cada página tenga el tamaño correcto */
          min-height: 100vh !important;
          max-height: 100vh !important;
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
          width: auto !important;
          height: auto !important;
          margin: 0 auto !important;
          padding: 40px !important;
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
          width: auto !important;
          height: auto !important;
        }
        
        /* Asegurar que las etiquetas individuales sean visibles */
        .label-page [style*="width"][style*="height"] {
          display: flex !important;
          visibility: visible !important;
        }
        
        /* Forzar recálculo del layout para múltiples páginas */
        .print-container .label-page:nth-child(n+4) {
          page-break-before: always !important;
          break-before: page !important;
        }
      }
    `}</style>
  );
}
