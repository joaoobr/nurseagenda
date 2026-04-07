import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

interface MedicationFormData {
  medication_name: string;
  dose: string;
  route: string;
  frequency: string;
  scheduled_time: string;
  start_date: string;
  end_date: string;
  notes: string;
  patient_id: string;
}

interface Patient {
  id: string;
  full_name: string;
}

interface MedicationFormProps {
  initialData?: Partial<MedicationFormData>;
  patients: Patient[];
  onSubmit: (data: MedicationFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ROUTES = ['oral', 'iv', 'im', 'sc', 'topical', 'inhalation', 'rectal', 'sublingual'];

const MedicationForm = ({ initialData, patients, onSubmit, onCancel, isLoading }: MedicationFormProps) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<MedicationFormData>({
    medication_name: initialData?.medication_name || '',
    dose: initialData?.dose || '',
    route: initialData?.route || 'oral',
    frequency: initialData?.frequency || '',
    scheduled_time: initialData?.scheduled_time || '',
    start_date: initialData?.start_date || format(new Date(), 'yyyy-MM-dd'),
    end_date: initialData?.end_date || '',
    notes: initialData?.notes || '',
    patient_id: initialData?.patient_id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {patients.length > 0 && (
        <div className="space-y-2">
          <Label>{t('medications.patient')}</Label>
          <Select value={form.patient_id} onValueChange={(v) => setForm(prev => ({ ...prev, patient_id: v }))}>
            <SelectTrigger>
              <SelectValue placeholder={t('medications.selectPatient')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('medications.noPatientLinked')}</SelectItem>
              {patients.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="medication_name">{t('medications.name')}</Label>
        <Input
          id="medication_name"
          value={form.medication_name}
          onChange={(e) => setForm(prev => ({ ...prev, medication_name: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="dose">{t('medications.dose')}</Label>
          <Input
            id="dose"
            value={form.dose}
            onChange={(e) => setForm(prev => ({ ...prev, dose: e.target.value }))}
            placeholder="500mg"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{t('medications.route')}</Label>
          <Select value={form.route} onValueChange={(v) => setForm(prev => ({ ...prev, route: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROUTES.map(r => (
                <SelectItem key={r} value={r}>{t(`medications.routes.${r}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="frequency">{t('medications.frequency')}</Label>
          <Input
            id="frequency"
            value={form.frequency}
            onChange={(e) => setForm(prev => ({ ...prev, frequency: e.target.value }))}
            placeholder={t('medications.frequencyPlaceholder')}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduled_time">{t('medications.time')}</Label>
          <Input
            id="scheduled_time"
            type="time"
            value={form.scheduled_time}
            onChange={(e) => setForm(prev => ({ ...prev, scheduled_time: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="start_date">{t('medications.startDate')}</Label>
          <Input
            id="start_date"
            type="date"
            value={form.start_date}
            onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">{t('medications.endDate')}</Label>
          <Input
            id="end_date"
            type="date"
            value={form.end_date}
            onChange={(e) => setForm(prev => ({ ...prev, end_date: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t('schedule.notes')}</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default MedicationForm;
