import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, Edit, FileText, AlertTriangle, Eye, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const NOTE_TYPES = ['evolution', 'incident', 'observation'] as const;

const NOTE_ICONS: Record<string, React.ElementType> = {
  evolution: FileText,
  incident: AlertTriangle,
  observation: Eye,
};

const NOTE_STYLES: Record<string, string> = {
  evolution: 'bg-blue-100 text-blue-800 border-blue-200',
  incident: 'bg-red-100 text-red-800 border-red-200',
  observation: 'bg-amber-100 text-amber-800 border-amber-200',
};

const NursingNotes = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterPatient, setFilterPatient] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Form state
  const [formPatientId, setFormPatientId] = useState('');
  const [formType, setFormType] = useState('evolution');
  const [formContent, setFormContent] = useState('');

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['nursing-notes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nursing_notes')
        .select('*, patients(full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-list', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('status', 'active')
        .order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('nursing_notes').insert({
        user_id: user!.id,
        patient_id: formPatientId,
        note_type: formType,
        content: formContent,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nursing-notes'] });
      resetForm();
      toast.success(t('nursingNotes.noteAdded'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('nursing_notes').update({
        patient_id: formPatientId,
        note_type: formType,
        content: formContent,
      }).eq('id', editingNote.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nursing-notes'] });
      resetForm();
      toast.success(t('nursingNotes.noteUpdated'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('nursing_notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nursing-notes'] });
      setShowDeleteConfirm(false);
      setDeleteId(null);
      toast.success(t('nursingNotes.noteDeleted'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingNote(null);
    setFormPatientId('');
    setFormType('evolution');
    setFormContent('');
  };

  const openEdit = (note: any) => {
    setEditingNote(note);
    setFormPatientId(note.patient_id);
    setFormType(note.note_type);
    setFormContent(note.content);
    setShowForm(true);
  };

  const filtered = notes.filter((n: any) => {
    const matchesSearch = !search || n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.patients?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesPatient = filterPatient === 'all' || n.patient_id === filterPatient;
    const matchesType = filterType === 'all' || n.note_type === filterType;
    return matchesSearch && matchesPatient && matchesType;
  });

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">{t('nursingNotes.title')}</h1>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> {t('nursingNotes.addNote')}
        </Button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="flex gap-2 mb-4">
        <Select value={filterPatient} onValueChange={setFilterPatient}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={t('nursingNotes.allPatients')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('nursingNotes.allPatients')}</SelectItem>
            {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('medications.all')}</SelectItem>
            {NOTE_TYPES.map(type => <SelectItem key={type} value={type}>{t(`nursingNotes.types.${type}`)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground text-sm py-8">{t('common.loading')}</p>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-40 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground text-sm">{t('nursingNotes.noNotes')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note: any) => {
            const Icon = NOTE_ICONS[note.note_type] || FileText;
            const style = NOTE_STYLES[note.note_type] || NOTE_STYLES.evolution;
            return (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${style}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-xs ${style}`}>
                          {t(`nursingNotes.types.${note.note_type}`)}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" /> {note.patients?.full_name}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(note.created_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(note)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleteId(note.id); setShowDeleteConfirm(true); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNote ? t('nursingNotes.editNote') : t('nursingNotes.addNote')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('medications.patient')}</Label>
              <Select value={formPatientId} onValueChange={setFormPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('medications.selectPatient')} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('nursingNotes.noteType')}</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TYPES.map(type => <SelectItem key={type} value={type}>{t(`nursingNotes.types.${type}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('nursingNotes.content')}</Label>
              <Textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={6}
                placeholder={t('nursingNotes.contentPlaceholder')}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={resetForm} className="flex-1">{t('common.cancel')}</Button>
              <Button
                className="flex-1"
                disabled={!formPatientId || !formContent || createMutation.isPending || updateMutation.isPending}
                onClick={() => editingNote ? updateMutation.mutate() : createMutation.mutate()}
              >
                {t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('nursingNotes.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('nursingNotes.confirmDeleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NursingNotes;
