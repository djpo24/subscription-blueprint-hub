
-- Add media_url column to incoming_messages table
ALTER TABLE public.incoming_messages 
ADD COLUMN media_url text;
