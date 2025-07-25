
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create the chat-images bucket if it doesn't exist
    const { data: buckets } = await supabaseClient.storage.listBuckets()
    const chatBucketExists = buckets?.some(bucket => bucket.name === 'chat-images')

    if (!chatBucketExists) {
      const { data, error } = await supabaseClient.storage.createBucket('chat-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })

      if (error) {
        console.error('Error creating chat-images bucket:', error)
        throw error
      }

      console.log('Created chat-images bucket:', data)

      // Create RLS policies for public access
      const { error: policyError } = await supabaseClient.rpc('exec', {
        sql: `
          -- Drop existing policies if they exist
          DROP POLICY IF EXISTS "Anyone can upload chat images" ON storage.objects;
          DROP POLICY IF EXISTS "Anyone can view chat images" ON storage.objects;
          DROP POLICY IF EXISTS "Anyone can update chat images" ON storage.objects;
          DROP POLICY IF EXISTS "Anyone can delete chat images" ON storage.objects;

          -- Create permissive policies for chat images
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
        `
      })

      if (policyError) {
        console.error('Error creating RLS policies:', policyError)
        // Don't throw here, bucket creation was successful
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Chat storage bucket ready' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error setting up chat storage:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
