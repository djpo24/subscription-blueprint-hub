
-- Agregar políticas RLS faltantes (solo si no existen)

-- Para dispatch_relations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dispatch_relations' 
    AND policyname = 'Users can view all dispatch relations'
  ) THEN
    CREATE POLICY "Users can view all dispatch relations" 
      ON public.dispatch_relations 
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dispatch_relations' 
    AND policyname = 'Admins can manage dispatch relations'
  ) THEN
    CREATE POLICY "Admins can manage dispatch relations" 
      ON public.dispatch_relations 
      FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Para dispatch_packages
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dispatch_packages' 
    AND policyname = 'Users can view all dispatch packages'
  ) THEN
    CREATE POLICY "Users can view all dispatch packages" 
      ON public.dispatch_packages 
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dispatch_packages' 
    AND policyname = 'Admins can manage dispatch packages'
  ) THEN
    CREATE POLICY "Admins can manage dispatch packages" 
      ON public.dispatch_packages 
      FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Para tracking_events
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tracking_events' 
    AND policyname = 'Users can view all tracking events'
  ) THEN
    CREATE POLICY "Users can view all tracking events" 
      ON public.tracking_events 
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tracking_events' 
    AND policyname = 'Admins can manage tracking events'
  ) THEN
    CREATE POLICY "Admins can manage tracking events" 
      ON public.tracking_events 
      FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Para user_profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can view all user profiles'
  ) THEN
    CREATE POLICY "Users can view all user profiles" 
      ON public.user_profiles 
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Admins can manage user profiles'
  ) THEN
    CREATE POLICY "Admins can manage user profiles" 
      ON public.user_profiles 
      FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Para notification_log, incoming_messages, message_delivery_status, notification_settings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_log' 
    AND policyname = 'Users can view all notification log'
  ) THEN
    CREATE POLICY "Users can view all notification log" 
      ON public.notification_log 
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_log' 
    AND policyname = 'Admins can manage notification log'
  ) THEN
    CREATE POLICY "Admins can manage notification log" 
      ON public.notification_log 
      FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'incoming_messages' 
    AND policyname = 'Users can view all incoming messages'
  ) THEN
    CREATE POLICY "Users can view all incoming messages" 
      ON public.incoming_messages 
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'incoming_messages' 
    AND policyname = 'Admins can manage incoming messages'
  ) THEN
    CREATE POLICY "Admins can manage incoming messages" 
      ON public.incoming_messages 
      FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'message_delivery_status' 
    AND policyname = 'Users can view all message delivery status'
  ) THEN
    CREATE POLICY "Users can view all message delivery status" 
      ON public.message_delivery_status 
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'message_delivery_status' 
    AND policyname = 'Admins can manage message delivery status'
  ) THEN
    CREATE POLICY "Admins can manage message delivery status" 
      ON public.message_delivery_status 
      FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_settings' 
    AND policyname = 'Users can view all notification settings'
  ) THEN
    CREATE POLICY "Users can view all notification settings" 
      ON public.notification_settings 
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_settings' 
    AND policyname = 'Admins can manage notification settings'
  ) THEN
    CREATE POLICY "Admins can manage notification settings" 
      ON public.notification_settings 
      FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_actions' 
    AND policyname = 'Users can view all user actions'
  ) THEN
    CREATE POLICY "Users can view all user actions" 
      ON public.user_actions 
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_actions' 
    AND policyname = 'Admins can manage user actions'
  ) THEN
    CREATE POLICY "Admins can manage user actions" 
      ON public.user_actions 
      FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;
