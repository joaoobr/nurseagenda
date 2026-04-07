import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Template {
  id: string;
  title: string;
  description: string | null;
  category: string;
  is_system: boolean;
  items: { id: string; title: string; sort_order: number }[];
}

interface Patient {
  id: string;
  full_name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
  onApplied: () => void;
}

const ApplyTemplateDialog = ({ open, onOpenChange, templates, onApplied }: Props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !open) return;
    supabase
      .from('patients')
      .select('id, full_name')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('full_name')
      .then(({ data }) => {
        if (data) setPatients(data);
      });
  }, [user, open]);

  const handleApply = async () => {
    if (!user || !selectedTemplate || !selectedPatient) return;
    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    setSaving(true);
    try {
      const { data: checklist } = await supabase
        .from('patient_checklists')
        .insert({
          user_id: user.id,
          patient_id: selectedPatient,
          template_id: template.id,
          title: template.title,
          status: 'in_progress',
        })
        .select()
        .single();

      if (checklist && template.items.length > 0) {
        await supabase.from('patient_checklist_items').insert(
          template.items.map((item) => ({
            checklist_id: checklist.id,
            title: item.title,
            sort_order: item.sort_order,
            is_completed: false,
          }))
        );
      }

      toast.success(t('checklists.checklistApplied'));
      setSelectedTemplate('');
      setSelectedPatient('');
      onApplied();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('checklists.applyTemplate')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>{t('checklists.selectTemplate')}</Label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
            >
              <option value="">{t('checklists.selectTemplate')}</option>
              {templates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.title} ({tmpl.items.length} {t('checklists.items')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>{t('medications.patient')}</Label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
            >
              <option value="">{t('medications.selectPatient')}</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>

          <Button
            className="w-full"
            onClick={handleApply}
            disabled={saving || !selectedTemplate || !selectedPatient}
          >
            {saving ? t('common.loading') : t('checklists.apply')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyTemplateDialog;
