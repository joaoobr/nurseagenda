import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

export interface PatientFormData {
  full_name: string;
  date_of_birth: string;
  gender: string;
  bed: string;
  room: string;
  diagnosis: string;
  allergies: string;
  blood_type: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  observations: string;
}

interface PatientFormProps {
  initialData?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['male', 'female', 'other'];

const PatientForm = ({ initialData, onSubmit, onCancel, isEditing }: PatientFormProps) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<PatientFormData>({
    full_name: initialData?.full_name || '',
    date_of_birth: initialData?.date_of_birth || '',
    gender: initialData?.gender || '',
    bed: initialData?.bed || '',
    room: initialData?.room || '',
    diagnosis: initialData?.diagnosis || '',
    allergies: initialData?.allergies || '',
    blood_type: initialData?.blood_type || '',
    emergency_contact_name: initialData?.emergency_contact_name || '',
    emergency_contact_phone: initialData?.emergency_contact_phone || '',
    observations: initialData?.observations || '',
  });

  const handleChange = (field: keyof PatientFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">
          {isEditing ? t('patients.editPatient') : t('patients.addPatient')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="full_name">{t('patients.name')} *</Label>
          <Input id="full_name" value={form.full_name} onChange={e => handleChange('full_name', e.target.value)} required maxLength={200} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">{t('patients.dateOfBirth')}</Label>
            <Input id="date_of_birth" type="date" value={form.date_of_birth} onChange={e => handleChange('date_of_birth', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('patients.gender')}</Label>
            <Select value={form.gender} onValueChange={v => handleChange('gender', v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {GENDERS.map(g => (
                  <SelectItem key={g} value={g}>{t(`patients.genders.${g}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="room">{t('patients.room')}</Label>
            <Input id="room" value={form.room} onChange={e => handleChange('room', e.target.value)} maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bed">{t('patients.bed')}</Label>
            <Input id="bed" value={form.bed} onChange={e => handleChange('bed', e.target.value)} maxLength={20} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diagnosis">{t('patients.diagnosis')}</Label>
          <Textarea id="diagnosis" value={form.diagnosis} onChange={e => handleChange('diagnosis', e.target.value)} maxLength={1000} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('patients.bloodType')}</Label>
            <Select value={form.blood_type} onValueChange={v => handleChange('blood_type', v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {BLOOD_TYPES.map(bt => (
                  <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">{t('patients.allergies')}</Label>
            <Input id="allergies" value={form.allergies} onChange={e => handleChange('allergies', e.target.value)} maxLength={500} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('patients.emergencyContact')}</Label>
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder={t('patients.name')} value={form.emergency_contact_name} onChange={e => handleChange('emergency_contact_name', e.target.value)} maxLength={200} />
            <Input placeholder={t('patients.phone')} type="tel" value={form.emergency_contact_phone} onChange={e => handleChange('emergency_contact_phone', e.target.value)} maxLength={20} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observations">{t('patients.observations')}</Label>
          <Textarea id="observations" value={form.observations} onChange={e => handleChange('observations', e.target.value)} rows={3} maxLength={2000} />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">{t('common.cancel')}</Button>
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
