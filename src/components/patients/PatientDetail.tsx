import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, User, Phone, Droplets, AlertTriangle, FileText, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Patient {
  id: string;
  full_name: string;
  date_of_birth?: string | null;
  gender?: string | null;
  bed?: string | null;
  room?: string | null;
  diagnosis?: string | null;
  allergies?: string | null;
  blood_type?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  observations?: string | null;
  status: string;
  admitted_at?: string | null;
}

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const InfoRow = ({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
};

const PatientDetail = ({ patient, onBack, onEdit, onDelete }: PatientDetailProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const age = patient.date_of_birth
    ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / 31557600000)
    : null;

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">{patient.full_name}</h1>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('patients.confirmDelete')}</AlertDialogTitle>
                <AlertDialogDescription>{t('patients.confirmDeleteDesc')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                  {t('common.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status & Basic Info */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">{t('patients.personalInfo')}</span>
            <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
              {t(`patients.statuses.${patient.status}`)}
            </Badge>
          </div>
          <InfoRow label={t('patients.gender')} value={patient.gender ? t(`patients.genders.${patient.gender}`) : null} icon={<User className="h-4 w-4" />} />
          <InfoRow label={t('patients.age')} value={age ? `${age} ${t('patients.years')}` : null} />
          <InfoRow label={t('patients.dateOfBirth')} value={patient.date_of_birth ? new Date(patient.date_of_birth + 'T00:00:00').toLocaleDateString() : null} />
          <InfoRow label={t('patients.bloodType')} value={patient.blood_type} icon={<Droplets className="h-4 w-4" />} />
        </div>

        {/* Location */}
        {(patient.room || patient.bed) && (
          <div className="p-4 rounded-xl border border-border bg-card space-y-1">
            <span className="text-sm font-medium text-foreground">{t('patients.location')}</span>
            <InfoRow label={t('patients.room')} value={patient.room} />
            <InfoRow label={t('patients.bed')} value={patient.bed} />
          </div>
        )}

        {/* Clinical */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <span className="text-sm font-medium text-foreground">{t('patients.clinicalInfo')}</span>
          <InfoRow label={t('patients.diagnosis')} value={patient.diagnosis} />
          <InfoRow label={t('patients.allergies')} value={patient.allergies} icon={<AlertTriangle className="h-4 w-4" />} />
          <InfoRow label={t('patients.observations')} value={patient.observations} />
        </div>

        {/* Emergency Contact */}
        {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
          <div className="p-4 rounded-xl border border-border bg-card space-y-1">
            <span className="text-sm font-medium text-foreground">{t('patients.emergencyContact')}</span>
            <InfoRow label={t('patients.name')} value={patient.emergency_contact_name} icon={<Phone className="h-4 w-4" />} />
            <InfoRow label={t('patients.phone')} value={patient.emergency_contact_phone} />
          </div>
        )}

        {/* Nursing Notes link */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate(`/nursing-notes?patient=${patient.id}`)}
        >
          <FileText className="h-4 w-4" />
          {t('nursingNotes.title')}
        </Button>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate(`/vital-signs?patient=${patient.id}`)}
        >
          <Activity className="h-4 w-4" />
          {t('vitalSigns.title')}
        </Button>
      </div>
    </div>
  );
};

export default PatientDetail;
