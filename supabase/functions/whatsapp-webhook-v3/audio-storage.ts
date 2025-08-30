
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function ensureAudioBucket(supabase: any) {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const audioBucketExists = buckets?.some((bucket: any) => bucket.name === 'whatsapp-audios');
    
    if (!audioBucketExists) {
      const { error } = await supabase.storage.createBucket('whatsapp-audios', {
        public: true,
        allowedMimeTypes: ['audio/ogg', 'audio/mpeg', 'audio/wav', 'audio/mp4'],
        fileSizeLimit: 16777216 // 16MB
      });
      
      if (error) {
        console.error('❌ Error creating audio bucket:', error);
        throw error;
      }
      console.log('✅ Audio bucket created successfully');
    }
  } catch (error) {
    console.error('❌ Error ensuring audio bucket:', error);
    throw error;
  }
}

export async function downloadAndStoreAudio(
  supabase: any,
  audioUrl: string, 
  messageId: string,
  whatsappToken: string
): Promise<string | null> {
  try {
    console.log('📥 Downloading audio from WhatsApp:', audioUrl);
    
    // Descargar el audio de WhatsApp
    const response = await fetch(audioUrl, {
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'User-Agent': 'WhatsApp-Audio-Downloader/1.0',
      },
      signal: AbortSignal.timeout(30000) // 30 segundos timeout
    });

    if (!response.ok) {
      console.error('❌ Failed to download audio:', response.status, response.statusText);
      return null;
    }

    const audioBlob = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'audio/ogg';
    
    console.log('📦 Audio downloaded, size:', audioBlob.byteLength, 'bytes');

    // Generar nombre único para el archivo
    const fileExtension = contentType.includes('mpeg') ? 'mp3' : 'ogg';
    const fileName = `${messageId}_${Date.now()}.${fileExtension}`;
    
    // Asegurar que el bucket existe
    await ensureAudioBucket(supabase);
    
    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('whatsapp-audios')
      .upload(fileName, audioBlob, {
        contentType,
        cacheControl: '31536000', // Cache por 1 año
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Error uploading audio to storage:', uploadError);
      return null;
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('whatsapp-audios')
      .getPublicUrl(uploadData.path);
    
    console.log('✅ Audio stored successfully:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('❌ Error downloading and storing audio:', error);
    return null;
  }
}
