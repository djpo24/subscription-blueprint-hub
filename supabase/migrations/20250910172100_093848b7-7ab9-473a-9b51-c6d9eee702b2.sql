-- Add DELETE policies for admins on incoming_messages
CREATE POLICY "Admins can delete incoming messages" 
ON incoming_messages 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- Add DELETE policies for admins on sent_messages  
CREATE POLICY "Admins can delete sent messages"
ON sent_messages
FOR DELETE
USING (get_current_user_role() = 'admin');