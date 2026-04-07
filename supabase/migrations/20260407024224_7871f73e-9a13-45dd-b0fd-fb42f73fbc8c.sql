
-- Table for motivational quotes
CREATE TABLE public.motivational_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language TEXT NOT NULL,
  day_of_year INTEGER NOT NULL CHECK (day_of_year >= 1 AND day_of_year <= 366),
  quote TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (language, day_of_year)
);

-- Table for nursing tips
CREATE TABLE public.nursing_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language TEXT NOT NULL,
  day_of_year INTEGER NOT NULL CHECK (day_of_year >= 1 AND day_of_year <= 366),
  tip TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (language, day_of_year)
);

-- Enable RLS
ALTER TABLE public.motivational_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_tips ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can read quotes and tips)
CREATE POLICY "Anyone can read motivational quotes"
  ON public.motivational_quotes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read nursing tips"
  ON public.nursing_tips FOR SELECT
  USING (true);
