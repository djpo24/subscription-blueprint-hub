
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
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        
        .screen-only {
          display: none !important;
        }
        
        @page {
          size: 10cm 15cm;
          margin: 0;
        }
        
        .label-page {
          width: 10cm !important;
          height: 15cm !important;
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
          position: relative !important;
          box-sizing: border-box !important;
          background: white !important;
          page-break-after: always !important;
          page-break-before: auto !important;
          page-break-inside: avoid !important;
          break-after: page !important;
          break-before: auto !important;
          break-inside: avoid !important;
          overflow: hidden !important;
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
          display: block !important;
          border: none !important;
          box-sizing: border-box !important;
          background: white !important;
          position: relative !important;
        }
      }
    `}</style>
  );
}
