
export interface TripFormData {
  route: string;
  flight_number: string;
}

export interface TripData {
  trip_date: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  status: string;
}

export interface CreateTripParams {
  formData: TripFormData;
  date: Date;
}
