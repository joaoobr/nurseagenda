import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Trash2, Edit, CheckCircle, PauseCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import MedicationForm from '@/components/medications/MedicationForm';
import MedicationCard from '@/components/medications/MedicationCard';
import { calculateScheduledTimes, parseFrequencyToHours, formatFrequencyLabel } from '@/utils/medicationSchedule';

type StatusFilter = 'all' | 'pending' | 'administered' | 'suspended';

const Medications = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState<any>(null);
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['medications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medications')
        .select('*, patients(full_name)')
        .order('scheduled_time', { ascending: true, nullsFirst: false });
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
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        user_id: user!.id,
        patient_id: data.patient_id === 'none' || !data.patient_id ? null : data.patient_id,
        scheduled_time: data.scheduled_time || null,
        end_date: data.end_date || null,
      };
      const { error } = await supabase.from('medications').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setShowForm(false);
      toast.success(t('medications.medAdded'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const payload = {
        ...data,
        patient_id: data.patient_id === 'none' || !data.patient_id ? null : data.patient_id,
        scheduled_time: data.scheduled_time || null,
        end_date: data.end_date || null,
      };
      const { error } = await supabase.from('medications').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setEditingMed(null);
      setSelectedMed(null);
      toast.success(t('medications.medUpdated'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('medications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setSelectedMed(null);
      setShowDeleteConfirm(false);
      toast.success(t('medications.medDeleted'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('medications').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      setSelectedMed(null);
      toast.success(t('medications.medUpdated'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const filtered = medications.filter((m: any) => {
    const matchesSearch = !search || m.medication_name.toLowerCase().includes(search.toLowerCase()) ||
      m.patients?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">{t('medications.title')}</h1>
        <Button size="sm" onClick={() => { setEditingMed(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> {t('medications.addMedication')}
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} className="mb-4">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">{t('medications.all')}</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">{t('medications.pending')}</TabsTrigger>
          <TabsTrigger value="administered" className="flex-1">{t('medications.administered')}</TabsTrigger>
          <TabsTrigger value="suspended" className="flex-1">{t('medications.suspended')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <p className="text-center text-muted-foreground text-sm py-8">{t('common.loading')}</p>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-40 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground text-sm">{t('medications.noMedications')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m: any) => (
            <MedicationCard key={m.id} medication={m} onClick={() => setSelectedMed(m)} />
          ))}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={showForm || !!editingMed} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingMed(null); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMed ? t('medications.editMedication') : t('medications.addMedication')}</DialogTitle>
          </DialogHeader>
          <MedicationForm
            patients={patients}
            initialData={editingMed ? {
              medication_name: editingMed.medication_name,
              dose: editingMed.dose,
              route: editingMed.route,
              frequency: editingMed.frequency,
              scheduled_time: editingMed.scheduled_time?.slice(0, 5) || '',
              start_date: editingMed.start_date,
              end_date: editingMed.end_date || '',
              notes: editingMed.notes || '',
              patient_id: editingMed.patient_id || '',
            } : undefined}
            onSubmit={(data) => editingMed ? updateMutation.mutate({ id: editingMed.id, ...data }) : createMutation.mutate(data)}
            onCancel={() => { setShowForm(false); setEditingMed(null); }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!selectedMed && !editingMed} onOpenChange={(open) => { if (!open) setSelectedMed(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMed?.medication_name}</DialogTitle>
          </DialogHeader>
          {selectedMed && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('medications.dose')}</span>
                <span className="font-medium">{selectedMed.dose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('medications.route')}</span>
                <span className="font-medium">{t(`medications.routes.${selectedMed.route}`)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('medications.frequency')}</span>
                <span className="font-medium">{formatFrequencyLabel(selectedMed.frequency)}</span>
              </div>
              {selectedMed.scheduled_time && (() => {
                const intervalHours = parseFrequencyToHours(selectedMed.frequency);
                const times = intervalHours
                  ? calculateScheduledTimes(selectedMed.scheduled_time.slice(0, 5), intervalHours)
                  : [selectedMed.scheduled_time.slice(0, 5)];
                return (
                  <div className="space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {t('medications.scheduledTimes')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {times.map((time) => (
                        <Badge key={time} variant="secondary" className="text-sm font-mono">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {selectedMed.patients?.full_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('medications.patient')}</span>
                  <span className="font-medium">{selectedMed.patients.full_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('medications.status')}</span>
                <span className="font-medium">{t(`medications.${selectedMed.status}`)}</span>
              </div>
              {selectedMed.notes && (
                <div>
                  <span className="text-muted-foreground">{t('schedule.notes')}</span>
                  <p className="mt-1 text-foreground">{selectedMed.notes}</p>
                </div>
              )}

              {/* Quick status actions */}
              <div className="flex gap-2 pt-2">
                {selectedMed.status !== 'administered' && (
                  <Button size="sm" variant="outline" className="flex-1 text-green-600" onClick={() => updateStatus.mutate({ id: selectedMed.id, status: 'administered' })}>
                    <CheckCircle className="h-4 w-4 mr-1" /> {t('medications.markAdministered')}
                  </Button>
                )}
                {selectedMed.status !== 'suspended' && (
                  <Button size="sm" variant="outline" className="flex-1 text-orange-600" onClick={() => updateStatus.mutate({ id: selectedMed.id, status: 'suspended' })}>
                    <PauseCircle className="h-4 w-4 mr-1" /> {t('medications.markSuspended')}
                  </Button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditingMed(selectedMed)}>
                  <Edit className="h-4 w-4 mr-1" /> {t('common.edit')}
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 className="h-4 w-4 mr-1" /> {t('common.delete')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('medications.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('medications.confirmDeleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedMed && deleteMutation.mutate(selectedMed.id)}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Medications;
