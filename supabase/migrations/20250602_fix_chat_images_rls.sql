
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view chat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update chat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete chat images" ON storage.objects;

-- Create more permissive policies for chat images
CREATE POLICY "Anyone can upload chat images" ON storage.objects
  FOR INSERT 
  WITH CHECK (bucket_id = 'chat-images');

CREATE POLICY "Anyone can view chat images" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'chat-images');

CREATE POLICY "Anyone can update chat images" ON storage.objects
  FOR UPDATE 
  USING (bucket_id = 'chat-images');

CREATE POLICY "Anyone can delete chat images" ON storage.objects
  FOR DELETE 
  USING (bucket_id = 'chat-images');
