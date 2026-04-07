
-- Drop and recreate with simpler schema
DROP TABLE IF EXISTS motivational_quotes;
DROP TABLE IF EXISTS nursing_tips;

CREATE TABLE public.motivational_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  quote TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.nursing_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  tip TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.motivational_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read motivational quotes" ON public.motivational_quotes FOR SELECT USING (true);
CREATE POLICY "Anyone can read nursing tips" ON public.nursing_tips FOR SELECT USING (true);

CREATE INDEX idx_quotes_language ON public.motivational_quotes(language, sort_order);
CREATE INDEX idx_tips_language ON public.nursing_tips(language, sort_order);
