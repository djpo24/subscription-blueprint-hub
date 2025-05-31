
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
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }
        
        .screen-only {
          display: none !important;
        }
        
        @page {
          size: 4in 6in;
          margin: 0.25in;
        }
        
        .label-item {
          margin: 0 auto !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
        }
        
        .label-item:last-child {
          page-break-after: auto;
        }
      }
    `}</style>
  );
}
