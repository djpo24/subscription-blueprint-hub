
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
          visibility: visible;
        }
        
        .print-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        
        .screen-only {
          display: none !important;
        }
        
        @page {
          size: 4in 6in;
          margin: 0;
        }
        
        .label-page {
          width: 4in !important;
          height: 6in !important;
          margin: 0 !important;
          padding: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          position: relative !important;
          page-break-after: always !important;
          page-break-inside: avoid !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
          background: white !important;
          break-after: page !important;
          border: none !important;
        }
        
        .label-page:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        
        .label-content {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          border: 2px solid #000 !important;
          box-sizing: border-box !important;
        }
        
        /* Forzar salto de página entre etiquetas */
        .label-page + .label-page {
          page-break-before: always !important;
          break-before: page !important;
        }
      }
    `}</style>
  );
}
