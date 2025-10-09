-- Add bulto_id to package_labels table
ALTER TABLE public.package_labels 
ADD COLUMN bulto_id UUID REFERENCES public.bultos(id);

-- Create index for better query performance
CREATE INDEX idx_package_labels_bulto_id ON public.package_labels(bulto_id);

-- Update RLS policies for package_labels to allow querying by bulto_id
DROP POLICY IF EXISTS "Users can view package labels" ON public.package_labels;
CREATE POLICY "Users can view package labels" 
ON public.package_labels 
FOR SELECT 
USING (true);