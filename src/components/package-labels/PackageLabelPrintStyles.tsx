
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
        
        .print-only, .print-only * {
          visibility: visible;
        }
        
        .print-only {
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
          margin: 0.25in;
          page-break-after: always;
        }
        
        .label-item {
          width: 4in !important;
          height: 6in !important;
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
          position: relative !important;
          page-break-before: always !important;
          page-break-after: always !important;
          page-break-inside: avoid !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
          background: white !important;
        }
        
        .label-item:first-child {
          page-break-before: avoid !important;
        }
        
        .label-item:last-child {
          page-break-after: avoid !important;
        }
      }
    `}</style>
  );
}
