
export interface Department {
  id: string;
  name: string;
  cities: City[];
}

export interface City {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
  departments?: Department[];
}

export const locationData: Country[] = [
  {
    id: 'CO',
    name: 'Colombia',
    departments: [
      {
        id: 'AMA',
        name: 'Amazonas',
        cities: [
          { id: 'LET', name: 'Leticia' },
          { id: 'PUE', name: 'Puerto Nariño' }
        ]
      },
      {
        id: 'ANT',
        name: 'Antioquia',
        cities: [
          { id: 'MED', name: 'Medellín' },
          { id: 'BEL', name: 'Bello' },
          { id: 'ITG', name: 'Itagüí' },
          { id: 'ENV', name: 'Envigado' },
          { id: 'CAL', name: 'Caldas' },
          { id: 'COP', name: 'Copacabana' }
        ]
      },
      {
        id: 'ARA',
        name: 'Arauca',
        cities: [
          { id: 'ARA', name: 'Arauca' },
          { id: 'ARA2', name: 'Arauquita' },
          { id: 'CRA', name: 'Cravo Norte' }
        ]
      },
      {
        id: 'ATL',
        name: 'Atlántico',
        cities: [
          { id: 'BAQ', name: 'Barranquilla' },
          { id: 'SOL', name: 'Soledad' },
          { id: 'MAL', name: 'Malambo' },
          { id: 'BAR', name: 'Baranoa' }
        ]
      },
      {
        id: 'BOL',
        name: 'Bolívar',
        cities: [
          { id: 'CTG', name: 'Cartagena' },
          { id: 'MAG', name: 'Magangué' },
          { id: 'TUR', name: 'Turbaco' },
          { id: 'ARM', name: 'Arjona' }
        ]
      },
      {
        id: 'BOY',
        name: 'Boyacá',
        cities: [
          { id: 'TUN', name: 'Tunja' },
          { id: 'DOL', name: 'Duitama' },
          { id: 'SOG', name: 'Sogamoso' },
          { id: 'CHI', name: 'Chiquinquirá' }
        ]
      },
      {
        id: 'CAL',
        name: 'Caldas',
        cities: [
          { id: 'MAN', name: 'Manizales' },
          { id: 'LAD', name: 'La Dorada' },
          { id: 'CHI2', name: 'Chinchiná' },
          { id: 'RIS', name: 'Riosucio' }
        ]
      },
      {
        id: 'CAQ',
        name: 'Caquetá',
        cities: [
          { id: 'FLO', name: 'Florencia' },
          { id: 'SVI', name: 'San Vicente del Caguán' },
          { id: 'BEL2', name: 'Belén de los Andaquíes' }
        ]
      },
      {
        id: 'CAS',
        name: 'Casanare',
        cities: [
          { id: 'YOP', name: 'Yopal' },
          { id: 'AGU', name: 'Aguazul' },
          { id: 'VIL', name: 'Villanueva' },
          { id: 'TAU', name: 'Tauramena' }
        ]
      },
      {
        id: 'CAU',
        name: 'Cauca',
        cities: [
          { id: 'POP', name: 'Popayán' },
          { id: 'SAN', name: 'Santander de Quilichao' },
          { id: 'PUE2', name: 'Puerto Tejada' },
          { id: 'GUA', name: 'Guapi' }
        ]
      },
      {
        id: 'CES',
        name: 'Cesar',
        cities: [
          { id: 'VAL', name: 'Valledupar' },
          { id: 'AGU2', name: 'Aguachica' },
          { id: 'BOC', name: 'Bosconia' },
          { id: 'COD', name: 'Codazzi' }
        ]
      },
      {
        id: 'CHO',
        name: 'Chocó',
        cities: [
          { id: 'QUI', name: 'Quibdó' },
          { id: 'ACN', name: 'Acandí' },
          { id: 'IST', name: 'Istmina' },
          { id: 'CON', name: 'Condoto' }
        ]
      },
      {
        id: 'COR',
        name: 'Córdoba',
        cities: [
          { id: 'MON', name: 'Montería' },
          { id: 'CER', name: 'Cereté' },
          { id: 'LOC', name: 'Lorica' },
          { id: 'SAH', name: 'Sahagún' }
        ]
      },
      {
        id: 'CUN',
        name: 'Cundinamarca',
        cities: [
          { id: 'BOG', name: 'Bogotá' },
          { id: 'SOA', name: 'Soacha' },
          { id: 'CHI3', name: 'Chía' },
          { id: 'ZIP', name: 'Zipaquirá' },
          { id: 'GIR', name: 'Girardot' },
          { id: 'FUS', name: 'Fusagasugá' }
        ]
      },
      {
        id: 'GUA2',
        name: 'Guainía',
        cities: [
          { id: 'INI', name: 'Inírida' },
          { id: 'BAR2', name: 'Barranco Minas' }
        ]
      },
      {
        id: 'GUV',
        name: 'Guaviare',
        cities: [
          { id: 'SJG', name: 'San José del Guaviare' },
          { id: 'CAL2', name: 'Calamar' },
          { id: 'ELR', name: 'El Retorno' }
        ]
      },
      {
        id: 'HUI',
        name: 'Huila',
        cities: [
          { id: 'NEI', name: 'Neiva' },
          { id: 'GAR', name: 'Garzón' },
          { id: 'PIR', name: 'Pitalito' },
          { id: 'LAP', name: 'La Plata' }
        ]
      },
      {
        id: 'LAG',
        name: 'La Guajira',
        cities: [
          { id: 'RIO', name: 'Riohacha' },
          { id: 'MAI', name: 'Maicao' },
          { id: 'URB', name: 'Uribia' },
          { id: 'VIL2', name: 'Villanueva' }
        ]
      },
      {
        id: 'MAG2',
        name: 'Magdalena',
        cities: [
          { id: 'SMA', name: 'Santa Marta' },
          { id: 'CIE', name: 'Ciénaga' },
          { id: 'FUN', name: 'Fundación' },
          { id: 'ARA3', name: 'Aracataca' }
        ]
      },
      {
        id: 'MET',
        name: 'Meta',
        cities: [
          { id: 'VIL3', name: 'Villavicencio' },
          { id: 'ACE', name: 'Acacías' },
          { id: 'GRA', name: 'Granada' },
          { id: 'PUE3', name: 'Puerto López' }
        ]
      },
      {
        id: 'NAR',
        name: 'Nariño',
        cities: [
          { id: 'PAS', name: 'Pasto' },
          { id: 'TUM', name: 'Tumaco' },
          { id: 'IPI', name: 'Ipiales' },
          { id: 'TUQ', name: 'Túquerres' }
        ]
      },
      {
        id: 'NSA',
        name: 'Norte de Santander',
        cities: [
          { id: 'CUC', name: 'Cúcuta' },
          { id: 'OCN', name: 'Ocaña' },
          { id: 'VCN', name: 'Villa del Rosario' },
          { id: 'PAM', name: 'Pamplona' }
        ]
      },
      {
        id: 'PUT',
        name: 'Putumayo',
        cities: [
          { id: 'MOC', name: 'Mocoa' },
          { id: 'PTO', name: 'Puerto Asís' },
          { id: 'ORI', name: 'Orito' },
          { id: 'VGZ', name: 'Valle del Guamuez' }
        ]
      },
      {
        id: 'QUI2',
        name: 'Quindío',
        cities: [
          { id: 'ARM2', name: 'Armenia' },
          { id: 'CAL3', name: 'Calarcá' },
          { id: 'MNT', name: 'Montenegro' },
          { id: 'QUI3', name: 'Quimbaya' }
        ]
      },
      {
        id: 'RIS2',
        name: 'Risaralda',
        cities: [
          { id: 'PER', name: 'Pereira' },
          { id: 'DOS', name: 'Dosquebradas' },
          { id: 'SRO', name: 'Santa Rosa de Cabal' },
          { id: 'LAV', name: 'La Virginia' }
        ]
      },
      {
        id: 'SAP',
        name: 'San Andrés y Providencia',
        cities: [
          { id: 'SAN2', name: 'San Andrés' },
          { id: 'PRO', name: 'Providencia' }
        ]
      },
      {
        id: 'SAN3',
        name: 'Santander',
        cities: [
          { id: 'BUC', name: 'Bucaramanga' },
          { id: 'FLO2', name: 'Floridablanca' },
          { id: 'GIR2', name: 'Girón' },
          { id: 'PIE', name: 'Piedecuesta' },
          { id: 'BAR3', name: 'Barrancabermeja' }
        ]
      },
      {
        id: 'SUC',
        name: 'Sucre',
        cities: [
          { id: 'SIN', name: 'Sincelejo' },
          { id: 'COZ', name: 'Corozal' },
          { id: 'SAM', name: 'Sampués' },
          { id: 'TOL2', name: 'Tolú' }
        ]
      },
      {
        id: 'TOL',
        name: 'Tolima',
        cities: [
          { id: 'IBA', name: 'Ibagué' },
          { id: 'ESP', name: 'Espinal' },
          { id: 'GUA3', name: 'Guamo' },
          { id: 'HON', name: 'Honda' }
        ]
      },
      {
        id: 'VAC',
        name: 'Valle del Cauca',
        cities: [
          { id: 'CAL4', name: 'Cali' },
          { id: 'YUM', name: 'Yumbo' },
          { id: 'PAL', name: 'Palmira' },
          { id: 'BUE', name: 'Buenaventura' },
          { id: 'TUL', name: 'Tuluá' },
          { id: 'CAR', name: 'Cartago' }
        ]
      },
      {
        id: 'VAU',
        name: 'Vaupés',
        cities: [
          { id: 'MIT', name: 'Mitú' },
          { id: 'CAR2', name: 'Carurú' },
          { id: 'TAR', name: 'Taraira' }
        ]
      },
      {
        id: 'VIC',
        name: 'Vichada',
        cities: [
          { id: 'PTO2', name: 'Puerto Carreño' },
          { id: 'LAP2', name: 'La Primavera' },
          { id: 'SFE', name: 'Santa Rosalía' }
        ]
      }
    ]
  },
  {
    id: 'CW',
    name: 'Curazao'
  }
];
