import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TemplateItem {
  id: string;
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
  templates: Template[];
  loading: boolean;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
}

const TemplateList = ({ templates, loading, onEdit, onDelete }: Props) => {
  const { t } = useTranslation();

  if (loading) return <p className="text-sm text-muted-foreground text-center py-8">{t('common.loading')}</p>;
  if (!templates.length) return <p className="text-sm text-muted-foreground text-center py-8">{t('checklists.noTemplates')}</p>;

  return (
    <div className="space-y-3">
      {templates.map((tmpl) => (
        <div key={tmpl.id} className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-foreground truncate">{tmpl.title}</h3>
                {tmpl.is_system && (
                  <Badge variant="secondary" className="text-[10px]">{t('checklists.system')}</Badge>
                )}
              </div>
              {tmpl.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{tmpl.description}</p>
              )}
            </div>
            {!tmpl.is_system && (
              <div className="flex gap-1 ml-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(tmpl)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('checklists.confirmDelete')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('checklists.confirmDeleteDesc')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(tmpl.id)}>{t('common.delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{tmpl.category}</Badge>
            <span className="text-[10px] text-muted-foreground">
              {tmpl.items.length} {t('checklists.items')}
            </span>
          </div>

          {tmpl.items.length > 0 && (
            <ul className="mt-2 space-y-1">
              {tmpl.items.slice(0, 3).map((item) => (
                <li key={item.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  {item.title}
                </li>
              ))}
              {tmpl.items.length > 3 && (
                <li className="text-xs text-muted-foreground/60">
                  +{tmpl.items.length - 3} {t('checklists.moreItems')}
                </li>
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default TemplateList;
