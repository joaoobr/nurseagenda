import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ClipboardList, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import TemplateList from '@/components/checklists/TemplateList';
import TemplateForm from '@/components/checklists/TemplateForm';
import PatientChecklistList from '@/components/checklists/PatientChecklistList';
import ApplyTemplateDialog from '@/components/checklists/ApplyTemplateDialog';

interface Template {
  id: string;
  title: string;
  description: string | null;
  category: string;
  is_system: boolean;
  user_id: string | null;
  items: { id: string; title: string; sort_order: number }[];
}

interface PatientChecklist {
  id: string;
  title: string;
  status: string;
  patient_id: string;
  template_id: string | null;
  created_at: string;
  completed_at: string | null;
  patient_name?: string;
  items: { id: string; title: string; is_completed: boolean; sort_order: number }[];
}

const Checklists = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [patientChecklists, setPatientChecklists] = useState<PatientChecklist[]>([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('checklist_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const templatesWithItems = await Promise.all(
        data.map(async (tmpl: any) => {
          const { data: items } = await supabase
            .from('checklist_template_items')
            .select('*')
            .eq('template_id', tmpl.id)
            .order('sort_order');
          return { ...tmpl, items: items || [] };
        })
      );
      setTemplates(templatesWithItems);
    }
  };

  const fetchPatientChecklists = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('patient_checklists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const withItems = await Promise.all(
        data.map(async (cl: any) => {
          const [{ data: items }, { data: patient }] = await Promise.all([
            supabase
              .from('patient_checklist_items')
              .select('*')
              .eq('checklist_id', cl.id)
              .order('sort_order'),
            supabase
              .from('patients')
              .select('full_name')
              .eq('id', cl.patient_id)
              .single(),
          ]);
          return { ...cl, items: items || [], patient_name: patient?.full_name };
        })
      );
      setPatientChecklists(withItems);
    }
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([fetchTemplates(), fetchPatientChecklists()]).finally(() => setLoading(false));
  }, [user]);

  const handleDeleteTemplate = async (id: string) => {
    await supabase.from('checklist_templates').delete().eq('id', id);
    toast.success(t('checklists.templateDeleted'));
    fetchTemplates();
  };

  const handleToggleItem = async (itemId: string, isCompleted: boolean, checklistId: string) => {
    await supabase
      .from('patient_checklist_items')
      .update({
        is_completed: !isCompleted,
        completed_at: !isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', itemId);

    // Check if all items are completed
    const checklist = patientChecklists.find((c) => c.id === checklistId);
    if (checklist) {
      const updatedItems = checklist.items.map((i) =>
        i.id === itemId ? { ...i, is_completed: !isCompleted } : i
      );
      const allDone = updatedItems.every((i) => i.is_completed);
      if (allDone) {
        await supabase
          .from('patient_checklists')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', checklistId);
      } else {
        await supabase
          .from('patient_checklists')
          .update({ status: 'in_progress', completed_at: null })
          .eq('id', checklistId);
      }
    }

    fetchPatientChecklists();
  };

  const handleDeleteChecklist = async (id: string) => {
    await supabase.from('patient_checklists').delete().eq('id', id);
    toast.success(t('checklists.checklistDeleted'));
    fetchPatientChecklists();
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">{t('checklists.title')}</h1>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="gap-1.5">
            <ClipboardList className="h-4 w-4" />
            {t('checklists.activeChecklists')}
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5">
            <FileText className="h-4 w-4" />
            {t('checklists.templates')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3">
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => setShowApplyDialog(true)}
          >
            <Plus className="h-4 w-4" />
            {t('checklists.applyTemplate')}
          </Button>

          <PatientChecklistList
            checklists={patientChecklists}
            loading={loading}
            onToggleItem={handleToggleItem}
            onDelete={handleDeleteChecklist}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-3">
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => {
              setEditingTemplate(null);
              setShowTemplateForm(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {t('checklists.addTemplate')}
          </Button>

          <TemplateList
            templates={templates}
            loading={loading}
            onEdit={(t) => {
              setEditingTemplate(t);
              setShowTemplateForm(true);
            }}
            onDelete={handleDeleteTemplate}
          />
        </TabsContent>
      </Tabs>

      {/* Template form dialog */}
      <Dialog open={showTemplateForm} onOpenChange={setShowTemplateForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? t('checklists.editTemplate') : t('checklists.addTemplate')}
            </DialogTitle>
          </DialogHeader>
          <TemplateForm
            template={editingTemplate}
            onSaved={() => {
              setShowTemplateForm(false);
              fetchTemplates();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Apply template dialog */}
      <ApplyTemplateDialog
        open={showApplyDialog}
        onOpenChange={setShowApplyDialog}
        templates={templates}
        onApplied={() => {
          setShowApplyDialog(false);
          fetchPatientChecklists();
        }}
      />
    </div>
  );
};

export default Checklists;
