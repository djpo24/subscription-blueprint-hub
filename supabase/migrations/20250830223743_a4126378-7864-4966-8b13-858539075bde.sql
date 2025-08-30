
-- Verificar y recrear las políticas de acceso para el bucket chat-images
-- Primero eliminamos las políticas existentes que pueden estar causando problemas
DROP POLICY IF EXISTS "Anyone can upload chat images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update chat images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete chat images" ON storage.objects;

-- Crear políticas más permisivas para el acceso a archivos de chat (incluyendo audios)
CREATE POLICY "Public access for chat files" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'chat-images');

CREATE POLICY "Authenticated users can upload chat files" ON storage.objects
  FOR INSERT 
  WITH CHECK (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update chat files" ON storage.objects
  FOR UPDATE 
  USING (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete chat files" ON storage.objects
  FOR DELETE 
  USING (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

-- Asegurar que el bucket sea público para visualización
UPDATE storage.buckets 
SET public = true 
WHERE id = 'chat-images';

-- Crear políticas adicionales para permitir acceso público a los archivos
CREATE POLICY "Public read access to chat files" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'chat-images');
