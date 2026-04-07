import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import PatientCard from '@/components/patients/PatientCard';
import PatientForm, { type PatientFormData } from '@/components/patients/PatientForm';
import PatientDetail from '@/components/patients/PatientDetail';

type View = 'list' | 'add' | 'edit' | 'detail';

const Patients = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const selectedPatient = patients.find(p => p.id === selectedId);

  const filtered = patients.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.diagnosis?.toLowerCase().includes(search.toLowerCase())) ||
    (p.room?.toLowerCase().includes(search.toLowerCase())) ||
    (p.bed?.toLowerCase().includes(search.toLowerCase()))
  );

  const createMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const { error } = await supabase.from('patients').insert({
        ...data,
        user_id: user!.id,
        date_of_birth: data.date_of_birth || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success(t('patients.patientAdded'));
      setView('list');
    },
    onError: () => toast.error(t('common.error')),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const { error } = await supabase.from('patients').update({
        ...data,
        date_of_birth: data.date_of_birth || null,
      }).eq('id', selectedId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success(t('patients.patientUpdated'));
      setView('detail');
    },
    onError: () => toast.error(t('common.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('patients').delete().eq('id', selectedId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success(t('patients.patientDeleted'));
      setSelectedId(null);
      setView('list');
    },
    onError: () => toast.error(t('common.error')),
  });

  if (view === 'add') {
    return <PatientForm onSubmit={createMutation.mutateAsync} onCancel={() => setView('list')} />;
  }

  if (view === 'edit' && selectedPatient) {
    return (
      <PatientForm
        initialData={{
          ...selectedPatient,
          date_of_birth: selectedPatient.date_of_birth || '',
        }}
        onSubmit={updateMutation.mutateAsync}
        onCancel={() => setView('detail')}
        isEditing
      />
    );
  }

  if (view === 'detail' && selectedPatient) {
    return (
      <PatientDetail
        patient={selectedPatient}
        onBack={() => { setSelectedId(null); setView('list'); }}
        onEdit={() => setView('edit')}
        onDelete={() => deleteMutation.mutate()}
      />
    );
  }

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">{t('patients.title')}</h1>
        <Button size="sm" onClick={() => setView('add')} className="gap-1">
          <Plus className="h-4 w-4" />
          {t('common.add')}
        </Button>
      </div>

      {patients.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground text-sm">{t('patients.noPatients')}</p>
          <Button variant="link" onClick={() => setView('add')} className="mt-2">
            {t('patients.addPatient')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onClick={id => { setSelectedId(id); setView('detail'); }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Patients;
