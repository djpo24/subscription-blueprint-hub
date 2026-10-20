
import type { CSSProperties, ReactNode } from 'react';
import { LabelData } from './PackageLabelGenerator';
import { formatAmount, formatDate, getCurrencySymbol } from '@/utils/labelFormatters';
import {
  LABEL_BRAND,
  LABEL_OFFICES,
  LABEL_TERMS,
  getCityCode,
  getCityName,
  getCurrencyName,
} from '@/utils/labelContent';

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

interface PackageLabelProps {
  package: Package;
  labelData?: LabelData;
}

const LINE = '0.4mm solid #000';

const ellipsis: CSSProperties = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

function ZoneTag({ letter, label, inverted = false }: { letter: string; label: string; inverted?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2mm', fontSize: '5.5pt', fontWeight: 'bold', marginBottom: '1mm' }}>
      <span style={{
        width: '3.2mm',
        height: '3.2mm',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: inverted ? '#fff' : '#000',
        color: inverted ? '#000' : '#fff',
      }}>
        {letter}
      </span>
      {label}
    </div>
  );
}

function Cell({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ padding: '1.6mm 2.5mm', minWidth: 0, ...style }}>{children}</div>;
}

// Vista previa de la etiqueta "Rejilla logística"; replica el PDF de LabelContentRenderer
export function PackageLabel({ package: pkg, labelData }: PackageLabelProps) {
  if (!labelData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Generando códigos QR y de barras...</p>
        </div>
      </div>
    );
  }

  const match = pkg.tracking_number.match(/^[A-Z]+-\d{4}-(\d+)$/);
  const guide = match ? match[1] : pkg.tracking_number;
  const weight = pkg.weight ? `${pkg.weight}kg` : '3kg';
  const amount = pkg.amount_to_collect ? formatAmount(pkg.amount_to_collect, pkg.currency) : '34.354.435';

  return (
    <div style={{
      width: '102mm',
      height: '152mm',
      padding: '3mm',
      margin: '20px auto',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: 'Helvetica, Arial, sans-serif',
      lineHeight: 1.15,
      boxSizing: 'border-box',
    }}>
      <div style={{ height: '100%', border: '0.6mm solid #000', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        {/* Marca y guía completa */}
        <div style={{ height: '10mm', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2.5mm', borderBottom: LINE }}>
          <div style={{ fontSize: '15pt', fontWeight: 'bold' }}>{LABEL_BRAND}</div>
          <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
            <div style={{ fontSize: '6pt' }}>ENCOMIENDA</div>
            <div style={{ fontSize: '10pt' }}>{pkg.tracking_number}</div>
          </div>
        </div>

        {/* A · Destino y origen */}
        <div style={{ height: '27mm', flex: 'none', backgroundColor: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', padding: '2.5mm 3mm 2mm', boxSizing: 'border-box' }}>
          <div style={{ minWidth: 0 }}>
            <ZoneTag letter="A" label="DESTINO" inverted />
            <div style={{ fontSize: '56pt', fontWeight: 'bold', lineHeight: 0.8 }}>{getCityCode(pkg.destination)}</div>
            <div style={{ fontSize: '9pt', fontWeight: 'bold', marginTop: '1.2mm', ...ellipsis }}>{getCityName(pkg.destination)}</div>
          </div>
          <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
            <div style={{ fontSize: '5.5pt' }}>ORIGEN</div>
            <div style={{ fontSize: '20pt', lineHeight: 1 }}>{getCityCode(pkg.origin)}</div>
            <div style={{ fontSize: '7pt', fontWeight: 'normal' }}>{getCityName(pkg.origin)}</div>
          </div>
        </div>

        {/* B · Destinatario */}
        <Cell style={{ height: '11mm', flex: 'none', borderBottom: LINE, boxSizing: 'border-box' }}>
          <ZoneTag letter="B" label="DESTINATARIO" />
          <div style={{ fontSize: '14pt', fontWeight: 'bold', ...ellipsis }}>{pkg.customers?.name || 'Cliente'}</div>
        </Cell>

        {/* C · D · E */}
        <div style={{ height: '12mm', flex: 'none', display: 'grid', gridTemplateColumns: '40mm 28mm 1fr', borderBottom: LINE }}>
          {([
            ['C', 'FECHA', formatDate(pkg.created_at)],
            ['D', 'PESO', weight],
            ['E', 'GUÍA', guide],
          ] as const).map(([letter, label, value], i) => (
            <Cell key={letter} style={i > 0 ? { borderLeft: LINE } : undefined}>
              <ZoneTag letter={letter} label={label} />
              <div style={{ fontSize: '12pt', fontWeight: 'bold', ...ellipsis }}>{value}</div>
            </Cell>
          ))}
        </div>

        {/* QR + F · Total a cobrar */}
        <div style={{ height: '42mm', flex: 'none', display: 'flex', borderBottom: LINE }}>
          <div style={{ padding: '2mm', borderRight: LINE }}>
            <img src={labelData.qrCodeDataUrl} alt="QR Code" style={{ width: '38mm', height: '38mm', display: 'block' }} />
          </div>
          <Cell style={{ flex: 1, padding: '2.5mm', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <ZoneTag letter="F" label="TOTAL A COBRAR" />
              <div style={{ fontSize: '26pt', fontWeight: 'bold', lineHeight: 1, ...ellipsis }}>
                {getCurrencySymbol(pkg.currency)}{amount}
              </div>
              <div style={{ fontSize: '6pt', fontWeight: 'bold', marginTop: '1mm' }}>{getCurrencyName(pkg.currency)}</div>
            </div>
            <div style={{ display: 'flex', gap: '4mm', fontSize: '6pt', fontWeight: 'bold' }}>
              {['PAGADO', 'VERIFICADO'].map(label => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '1.2mm' }}>
                  <span style={{ width: '3.2mm', height: '3.2mm', border: '0.35mm solid #000', boxSizing: 'border-box' }} />
                  {label}
                </span>
              ))}
            </div>
          </Cell>
        </div>

        {/* Código de barras */}
        <div style={{ height: '23mm', flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: LINE }}>
          <img src={labelData.barcodeDataUrl} alt="Barcode" style={{ width: '70mm', height: '15mm', display: 'block' }} />
          <div style={{ fontSize: '7pt', fontWeight: 'bold', marginTop: '1mm' }}>{pkg.tracking_number}</div>
        </div>

        {/* Aviso de reclamos + sedes */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '46mm 1fr', minHeight: 0 }}>
          <Cell style={{ display: 'flex', alignItems: 'center', fontSize: '6.6pt', fontWeight: 'bold', borderRight: LINE }}>
            {LABEL_TERMS}
          </Cell>
          <Cell style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '5.8pt' }}>
            {LABEL_OFFICES.map(office => (
              <div key={office.city}>
                <div style={{ fontWeight: 'bold' }}>Dirección {office.city}:</div>
                <div>{office.address}</div>
                <div>Tel: {office.phone}</div>
              </div>
            ))}
          </Cell>
        </div>
      </div>
    </div>
  );
}
