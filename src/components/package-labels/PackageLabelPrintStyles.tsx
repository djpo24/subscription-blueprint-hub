
import React from 'react';

export function PackageLabelPrintStyles() {
  return (
    <style>{`
      @media print {
        body * {
          visibility: hidden;
          margin: 0;
          padding: 0;
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
        }
        .screen-only {
          display: none !important;
        }
        @page {
          size: 10cm 15cm;
          margin: 0;
        }
      }
      
      @media screen {
        .print-only {
          display: none;
        }
      }
      
      .package-label-container {
        page-break-after: always;
      }
    `}</style>
  );
}
