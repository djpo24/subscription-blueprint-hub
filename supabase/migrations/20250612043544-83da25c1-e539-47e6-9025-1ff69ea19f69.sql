
-- Add foreign key constraint between packages and trips tables
ALTER TABLE public.packages 
ADD CONSTRAINT packages_trip_id_fkey 
FOREIGN KEY (trip_id) REFERENCES public.trips(id);
