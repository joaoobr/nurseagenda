
-- Checklist templates (system-wide or personal)
CREATE TABLE public.checklist_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Template items (steps within a template)
CREATE TABLE public.checklist_template_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.checklist_templates(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Patient checklists (applied template to a patient)
CREATE TABLE public.patient_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.checklist_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Patient checklist items (individual tasks)
CREATE TABLE public.patient_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID REFERENCES public.patient_checklists(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_checklist_items ENABLE ROW LEVEL SECURITY;

-- RLS: checklist_templates (system templates visible to all, personal only to owner)
CREATE POLICY "Anyone can view system templates" ON public.checklist_templates
  FOR SELECT TO authenticated USING (is_system = true);

CREATE POLICY "Users can view own templates" ON public.checklist_templates
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own templates" ON public.checklist_templates
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can update own templates" ON public.checklist_templates
  FOR UPDATE TO authenticated USING (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can delete own templates" ON public.checklist_templates
  FOR DELETE TO authenticated USING (user_id = auth.uid() AND is_system = false);

-- RLS: checklist_template_items (follow template access)
CREATE POLICY "Users can view template items" ON public.checklist_template_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.checklist_templates t
      WHERE t.id = template_id AND (t.is_system = true OR t.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own template items" ON public.checklist_template_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checklist_templates t
      WHERE t.id = template_id AND t.user_id = auth.uid() AND t.is_system = false
    )
  );

CREATE POLICY "Users can update own template items" ON public.checklist_template_items
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.checklist_templates t
      WHERE t.id = template_id AND t.user_id = auth.uid() AND t.is_system = false
    )
  );

CREATE POLICY "Users can delete own template items" ON public.checklist_template_items
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.checklist_templates t
      WHERE t.id = template_id AND t.user_id = auth.uid() AND t.is_system = false
    )
  );

-- RLS: patient_checklists
CREATE POLICY "Users can view own patient checklists" ON public.patient_checklists
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own patient checklists" ON public.patient_checklists
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own patient checklists" ON public.patient_checklists
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own patient checklists" ON public.patient_checklists
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- RLS: patient_checklist_items (follow checklist access)
CREATE POLICY "Users can view own checklist items" ON public.patient_checklist_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.patient_checklists c WHERE c.id = checklist_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own checklist items" ON public.patient_checklist_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patient_checklists c WHERE c.id = checklist_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Users can update own checklist items" ON public.patient_checklist_items
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.patient_checklists c WHERE c.id = checklist_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own checklist items" ON public.patient_checklist_items
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.patient_checklists c WHERE c.id = checklist_id AND c.user_id = auth.uid())
  );

-- Updated_at triggers
CREATE TRIGGER update_checklist_templates_updated_at BEFORE UPDATE ON public.checklist_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_patient_checklists_updated_at BEFORE UPDATE ON public.patient_checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
