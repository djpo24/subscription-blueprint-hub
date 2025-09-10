-- Create storage bucket for WhatsApp media files
INSERT INTO storage.buckets (id, name, public) VALUES ('whatsapp-media', 'whatsapp-media', true);

-- Create policies for WhatsApp media bucket
CREATE POLICY "WhatsApp media files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'whatsapp-media');

CREATE POLICY "System can upload WhatsApp media files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'whatsapp-media');

CREATE POLICY "System can update WhatsApp media files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'whatsapp-media');

CREATE POLICY "System can delete WhatsApp media files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'whatsapp-media');