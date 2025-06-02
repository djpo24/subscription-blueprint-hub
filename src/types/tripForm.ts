
export interface TripFormData {
  route: string;
  flight_number: string;
  traveler_id: string;
}

export interface TripData {
  trip_date: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  traveler_id: string | null;
  status: string;
}

export interface CreateTripParams {
  formData: TripFormData;
  date: Date;
}
