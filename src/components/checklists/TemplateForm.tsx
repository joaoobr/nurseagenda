import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateItem {
  id?: string;
  title: string;
  sort_order: number;
}

interface Template {
  id: string;
  title: string;
  description: string | null;
  category: string;
  is_system: boolean;
  user_id: string | null;
  items: TemplateItem[];
}

interface Props {
  template: Template | null;
  onSaved: () => void;
}

const CATEGORIES = ['general', 'admission', 'discharge', 'procedure', 'daily_care'];

const TemplateForm = ({ template, onSaved }: Props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [title, setTitle] = useState(template?.title || '');
  const [description, setDescription] = useState(template?.description || '');
  const [category, setCategory] = useState(template?.category || 'general');
  const [items, setItems] = useState<TemplateItem[]>(
    template?.items?.length ? template.items : [{ title: '', sort_order: 0 }]
  );
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    setItems([...items, { title: '', sort_order: items.length }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string) => {
    setItems(items.map((item, i) => (i === index ? { ...item, title: value } : item)));
  };

  const handleSave = async () => {
    if (!user || !title.trim()) return;
    const validItems = items.filter((i) => i.title.trim());
    if (!validItems.length) return;

    setSaving(true);
    try {
      if (template) {
        // Update
        await supabase.from('checklist_templates').update({ title, description, category }).eq('id', template.id);
        // Delete old items and re-insert
        await supabase.from('checklist_template_items').delete().eq('template_id', template.id);
        await supabase.from('checklist_template_items').insert(
          validItems.map((item, i) => ({ template_id: template.id, title: item.title, sort_order: i }))
        );
        toast.success(t('checklists.templateUpdated'));
      } else {
        // Create
        const { data: newTemplate } = await supabase
          .from('checklist_templates')
          .insert({ user_id: user.id, title, description, category, is_system: false })
          .select()
          .single();

        if (newTemplate) {
          await supabase.from('checklist_template_items').insert(
            validItems.map((item, i) => ({ template_id: newTemplate.id, title: item.title, sort_order: i }))
          );
        }
        toast.success(t('checklists.templateAdded'));
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{t('checklists.templateTitle')}</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('checklists.templateTitlePlaceholder')} />
      </div>

      <div>
        <Label>{t('checklists.descriptionLabel')}</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </div>

      <div>
        <Label>{t('checklists.category')}</Label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{t(`checklists.categories.${cat}`)}</option>
          ))}
        </select>
      </div>

      <div>
        <Label className="mb-2 block">{t('checklists.items')}</Label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                value={item.title}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={`${t('checklists.item')} ${index + 1}`}
                className="flex-1"
              />
              {items.length > 1 && (
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => removeItem(index)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full mt-2 gap-1" onClick={addItem}>
          <Plus className="h-3.5 w-3.5" />
          {t('checklists.addItem')}
        </Button>
      </div>

      <Button className="w-full" onClick={handleSave} disabled={saving || !title.trim()}>
        {saving ? t('common.loading') : t('common.save')}
      </Button>
    </div>
  );
};

export default TemplateForm;
