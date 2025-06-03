
import { supabase } from '@/integrations/supabase/client';

export async function ensureChatStorageBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const chatBucketExists = buckets?.some(bucket => bucket.name === 'chat-images');
    
    if (!chatBucketExists) {
      const { error } = await supabase.functions.invoke('create-chat-storage');
      if (error) {
        console.error('Error creating chat storage bucket:', error);
        throw error;
      }
      console.log('Chat storage bucket created successfully');
    }
  } catch (error) {
    console.error('Error ensuring chat storage bucket:', error);
    throw error;
  }
}

export async function uploadImage(image: File): Promise<string> {
  console.log('📸 Uploading image...');
  await ensureChatStorageBucket();

  const fileExt = image.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('chat-images')
    .upload(fileName, image, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('❌ Image upload failed:', uploadError);
    throw new Error('Error al subir la imagen: ' + uploadError.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('chat-images')
    .getPublicUrl(uploadData.path);
  
  console.log('✅ Image uploaded successfully:', publicUrl);
  return publicUrl;
}
