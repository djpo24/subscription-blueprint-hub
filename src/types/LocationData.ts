
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
        id: 'ANT',
        name: 'Antioquia',
        cities: [
          { id: 'MED', name: 'Medellín' },
          { id: 'BOG', name: 'Bello' },
          { id: 'ITG', name: 'Itagüí' },
          { id: 'ENV', name: 'Envigado' }
        ]
      },
      {
        id: 'CUN',
        name: 'Cundinamarca',
        cities: [
          { id: 'BOG', name: 'Bogotá' },
          { id: 'SOA', name: 'Soacha' },
          { id: 'CHI', name: 'Chía' },
          { id: 'ZIP', name: 'Zipaquirá' }
        ]
      },
      {
        id: 'VAC',
        name: 'Valle del Cauca',
        cities: [
          { id: 'CAL', name: 'Cali' },
          { id: 'YUM', name: 'Yumbo' },
          { id: 'PAL', name: 'Palmira' },
          { id: 'BUE', name: 'Buenaventura' }
        ]
      }
    ]
  },
  {
    id: 'CW',
    name: 'Curazao'
  }
];
