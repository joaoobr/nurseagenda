
CREATE TABLE public.nursing_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL DEFAULT 'evolution',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.nursing_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nursing notes" ON public.nursing_notes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nursing notes" ON public.nursing_notes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nursing notes" ON public.nursing_notes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own nursing notes" ON public.nursing_notes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_nursing_notes_updated_at
  BEFORE UPDATE ON public.nursing_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
