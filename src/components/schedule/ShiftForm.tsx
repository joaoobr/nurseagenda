import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

interface ShiftFormData {
  title: string;
  shift_type: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  location: string;
  sector: string;
  notes: string;
  is_day_off: boolean;
}

interface ShiftFormProps {
  initialData?: Partial<ShiftFormData>;
  onSubmit: (data: ShiftFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SHIFT_DEFAULTS: Record<string, { start: string; end: string }> = {
  morning: { start: '07:00', end: '13:00' },
  afternoon: { start: '13:00', end: '19:00' },
  night: { start: '19:00', end: '07:00' },
};

const ShiftForm = ({ initialData, onSubmit, onCancel, isLoading }: ShiftFormProps) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<ShiftFormData>({
    title: initialData?.title || '',
    shift_type: initialData?.shift_type || 'morning',
    shift_date: initialData?.shift_date || format(new Date(), 'yyyy-MM-dd'),
    start_time: initialData?.start_time || '07:00',
    end_time: initialData?.end_time || '13:00',
    location: initialData?.location || '',
    sector: initialData?.sector || '',
    notes: initialData?.notes || '',
    is_day_off: initialData?.is_day_off || false,
  });

  const handleShiftTypeChange = (type: string) => {
    const defaults = SHIFT_DEFAULTS[type] || SHIFT_DEFAULTS.morning;
    setForm(prev => ({
      ...prev,
      shift_type: type,
      start_time: prev.start_time === SHIFT_DEFAULTS[prev.shift_type]?.start ? defaults.start : prev.start_time,
      end_time: prev.end_time === SHIFT_DEFAULTS[prev.shift_type]?.end ? defaults.end : prev.end_time,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="is_day_off">{t('schedule.dayOff')}</Label>
        <Switch
          id="is_day_off"
          checked={form.is_day_off}
          onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_day_off: checked }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">{t('schedule.shiftTitle')}</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
          placeholder={form.is_day_off ? t('schedule.dayOff') : t('schedule.shiftTitle')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shift_date">{t('schedule.date')}</Label>
        <Input
          id="shift_date"
          type="date"
          value={form.shift_date}
          onChange={(e) => setForm(prev => ({ ...prev, shift_date: e.target.value }))}
          required
        />
      </div>

      {!form.is_day_off && (
        <>
          <div className="space-y-2">
            <Label>{t('schedule.shiftType')}</Label>
            <Select value={form.shift_type} onValueChange={handleShiftTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">{t('schedule.morning')}</SelectItem>
                <SelectItem value="afternoon">{t('schedule.afternoon')}</SelectItem>
                <SelectItem value="night">{t('schedule.night')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start_time">{t('schedule.startTime')}</Label>
              <Input
                id="start_time"
                type="time"
                value={form.start_time}
                onChange={(e) => setForm(prev => ({ ...prev, start_time: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">{t('schedule.endTime')}</Label>
              <Input
                id="end_time"
                type="time"
                value={form.end_time}
                onChange={(e) => setForm(prev => ({ ...prev, end_time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('schedule.location')}</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">{t('schedule.sector')}</Label>
            <Input
              id="sector"
              value={form.sector}
              onChange={(e) => setForm(prev => ({ ...prev, sector: e.target.value }))}
            />
          </div>
        </>
      )}

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

export default ShiftForm;
