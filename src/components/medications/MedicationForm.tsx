import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { FREQUENCY_PRESETS, calculateScheduledTimes } from '@/utils/medicationSchedule';

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

  // Determine if initial frequency matches a preset
  const initialPreset = FREQUENCY_PRESETS.find(p => p.value === initialData?.frequency);
  const isInitialCustom = initialData?.frequency && !initialPreset && initialData.frequency !== '';

  const [form, setForm] = useState<MedicationFormData>({
    medication_name: initialData?.medication_name || '',
    dose: initialData?.dose || '',
    route: initialData?.route || 'oral',
    frequency: isInitialCustom ? 'custom' : (initialData?.frequency || ''),
    scheduled_time: initialData?.scheduled_time || '',
    start_date: initialData?.start_date || format(new Date(), 'yyyy-MM-dd'),
    end_date: initialData?.end_date || '',
    notes: initialData?.notes || '',
    patient_id: initialData?.patient_id || '',
  });

  const [customInterval, setCustomInterval] = useState(isInitialCustom ? initialData?.frequency || '' : '');

  // Get the effective interval hours
  const effectiveFrequency = form.frequency === 'custom' ? customInterval : form.frequency;
  const intervalHours = useMemo(() => {
    const num = Number(effectiveFrequency);
    return !isNaN(num) && num > 0 && num <= 24 ? num : null;
  }, [effectiveFrequency]);

  // Calculate scheduled times
  const scheduledTimes = useMemo(() => {
    if (!form.scheduled_time || !intervalHours) return [];
    return calculateScheduledTimes(form.scheduled_time, intervalHours);
  }, [form.scheduled_time, intervalHours]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...form,
      frequency: effectiveFrequency,
    };
    onSubmit(submitData);
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

      {/* Frequency preset + first dose time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>{t('medications.frequency')}</Label>
          <Select value={form.frequency} onValueChange={(v) => setForm(prev => ({ ...prev, frequency: v }))}>
            <SelectTrigger>
              <SelectValue placeholder={t('medications.selectFrequency')} />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_PRESETS.map(p => (
                <SelectItem key={p.value} value={p.value}>
                  {t(`medications.frequencies.${p.value}`, p.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduled_time">{t('medications.firstDose')}</Label>
          <Input
            id="scheduled_time"
            type="time"
            value={form.scheduled_time}
            onChange={(e) => setForm(prev => ({ ...prev, scheduled_time: e.target.value }))}
          />
        </div>
      </div>

      {/* Custom interval input */}
      {form.frequency === 'custom' && (
        <div className="space-y-2">
          <Label htmlFor="custom_interval">{t('medications.customInterval')}</Label>
          <Input
            id="custom_interval"
            type="number"
            min="1"
            max="24"
            value={customInterval}
            onChange={(e) => setCustomInterval(e.target.value)}
            placeholder={t('medications.customIntervalPlaceholder')}
            required
          />
        </div>
      )}

      {/* Calculated schedule preview */}
      {scheduledTimes.length > 1 && (
        <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {t('medications.calculatedSchedule')}
          </p>
          <div className="flex flex-wrap gap-2">
            {scheduledTimes.map((time) => (
              <Badge key={time} variant="secondary" className="text-sm font-mono">
                {time}
              </Badge>
            ))}
          </div>
        </div>
      )}

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
