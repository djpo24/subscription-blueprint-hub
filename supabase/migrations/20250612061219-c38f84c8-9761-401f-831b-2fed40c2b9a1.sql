
-- Tabla para almacenar todas las interacciones del chatbot
CREATE TABLE public.ai_chat_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  customer_phone TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  context_info JSONB, -- información del contexto (paquetes, etc.)
  response_time_ms INTEGER, -- tiempo de respuesta en milisegundos
  was_fallback BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para almacenar feedback de las respuestas
CREATE TABLE public.ai_response_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interaction_id UUID REFERENCES public.ai_chat_interactions(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative', 'neutral')),
  feedback_source TEXT NOT NULL CHECK (feedback_source IN ('user_reaction', 'agent_rating', 'auto_detected')),
  feedback_details JSONB, -- detalles adicionales del feedback
  agent_notes TEXT, -- notas del agente si aplicable
  created_by UUID REFERENCES public.user_profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para patrones de mejora identificados
CREATE TABLE public.ai_improvement_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_type TEXT NOT NULL, -- 'frequent_question', 'poor_response', 'missing_context'
  pattern_description TEXT NOT NULL,
  example_interactions UUID[] DEFAULT '{}', -- referencias a interacciones de ejemplo
  suggested_improvement TEXT,
  priority_score INTEGER DEFAULT 1 CHECK (priority_score >= 1 AND priority_score <= 10),
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'reviewed', 'implemented', 'discarded')),
  identified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.user_profiles(user_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_ai_chat_interactions_customer_phone ON public.ai_chat_interactions(customer_phone);
CREATE INDEX idx_ai_chat_interactions_created_at ON public.ai_chat_interactions(created_at);
CREATE INDEX idx_ai_response_feedback_interaction_id ON public.ai_response_feedback(interaction_id);
CREATE INDEX idx_ai_response_feedback_type ON public.ai_response_feedback(feedback_type);
CREATE INDEX idx_ai_improvement_patterns_status ON public.ai_improvement_patterns(status);
CREATE INDEX idx_ai_improvement_patterns_priority ON public.ai_improvement_patterns(priority_score DESC);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.ai_chat_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_response_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_improvement_patterns ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ai_chat_interactions
CREATE POLICY "Anyone can view chat interactions" 
  ON public.ai_chat_interactions 
  FOR SELECT 
  USING (true);

CREATE POLICY "System can insert chat interactions" 
  ON public.ai_chat_interactions 
  FOR INSERT 
  WITH CHECK (true);

-- Políticas RLS para ai_response_feedback
CREATE POLICY "Anyone can view feedback" 
  ON public.ai_response_feedback 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create feedback" 
  ON public.ai_response_feedback 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own feedback" 
  ON public.ai_response_feedback 
  FOR UPDATE 
  USING (created_by = auth.uid());

-- Políticas RLS para ai_improvement_patterns
CREATE POLICY "Anyone can view improvement patterns" 
  ON public.ai_improvement_patterns 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create patterns" 
  ON public.ai_improvement_patterns 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update patterns they created or if admin" 
  ON public.ai_improvement_patterns 
  FOR UPDATE 
  USING (
    reviewed_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
