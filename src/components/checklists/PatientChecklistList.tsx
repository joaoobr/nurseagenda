import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, CheckCircle2, Clock } from 'lucide-react';
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

interface ChecklistItem {
  id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
}

interface PatientChecklist {
  id: string;
  title: string;
  status: string;
  patient_id: string;
  created_at: string;
  completed_at: string | null;
  patient_name?: string;
  items: ChecklistItem[];
}

interface Props {
  checklists: PatientChecklist[];
  loading: boolean;
  onToggleItem: (itemId: string, isCompleted: boolean, checklistId: string) => void;
  onDelete: (id: string) => void;
}

const PatientChecklistList = ({ checklists, loading, onToggleItem, onDelete }: Props) => {
  const { t } = useTranslation();

  if (loading) return <p className="text-sm text-muted-foreground text-center py-8">{t('common.loading')}</p>;
  if (!checklists.length) return <p className="text-sm text-muted-foreground text-center py-8">{t('checklists.noChecklists')}</p>;

  return (
    <div className="space-y-3">
      {checklists.map((cl) => {
        const completed = cl.items.filter((i) => i.is_completed).length;
        const total = cl.items.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <div key={cl.id} className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">{cl.title}</h3>
                {cl.patient_name && (
                  <p className="text-xs text-muted-foreground">{cl.patient_name}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <Badge
                  variant={cl.status === 'completed' ? 'default' : 'secondary'}
                  className="text-[10px] gap-1"
                >
                  {cl.status === 'completed' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {cl.status === 'completed' ? t('checklists.completed') : t('checklists.inProgress')}
                </Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
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
                      <AlertDialogAction onClick={() => onDelete(cl.id)}>{t('common.delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-muted rounded-full mb-3">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">
              {completed}/{total} ({progress}%)
            </p>

            {/* Items */}
            <div className="space-y-2">
              {cl.items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 cursor-pointer"
                >
                  <Checkbox
                    checked={item.is_completed}
                    onCheckedChange={() => onToggleItem(item.id, item.is_completed, cl.id)}
                  />
                  <span
                    className={`text-sm ${
                      item.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {item.title}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PatientChecklistList;
