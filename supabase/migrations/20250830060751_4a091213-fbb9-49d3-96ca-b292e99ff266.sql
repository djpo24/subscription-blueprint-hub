
-- Enable RLS on marketing_message_log table
ALTER TABLE public.marketing_message_log ENABLE ROW LEVEL SECURITY;

-- Create policies for marketing_message_log
CREATE POLICY "Admins can manage marketing message log" 
  ON public.marketing_message_log 
  FOR ALL 
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "System can manage marketing message log" 
  ON public.marketing_message_log 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Enable RLS on marketing_campaigns table
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for marketing_campaigns
CREATE POLICY "Admins can manage marketing campaigns" 
  ON public.marketing_campaigns 
  FOR ALL 
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "System can manage marketing campaigns" 
  ON public.marketing_campaigns 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Enable RLS on marketing_contacts table
ALTER TABLE public.marketing_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for marketing_contacts
CREATE POLICY "Admins can manage marketing contacts" 
  ON public.marketing_contacts 
  FOR ALL 
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "System can manage marketing contacts" 
  ON public.marketing_contacts 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Enable RLS on marketing_settings table
ALTER TABLE public.marketing_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for marketing_settings
CREATE POLICY "Admins can manage marketing settings" 
  ON public.marketing_settings 
  FOR ALL 
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "System can manage marketing settings" 
  ON public.marketing_settings 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Enable RLS on route_freight_rates table
ALTER TABLE public.route_freight_rates ENABLE ROW LEVEL SECURITY;

-- Create policies for route_freight_rates
CREATE POLICY "Users can view route freight rates" 
  ON public.route_freight_rates 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage route freight rates" 
  ON public.route_freight_rates 
  FOR ALL 
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "System can manage route freight rates" 
  ON public.route_freight_rates 
  FOR ALL 
  USING (true)
  WITH CHECK (true);
