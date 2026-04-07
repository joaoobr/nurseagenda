import { useTranslation } from 'react-i18next';
import { User, BedDouble, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PatientCardProps {
  patient: {
    id: string;
    full_name: string;
    bed?: string | null;
    room?: string | null;
    diagnosis?: string | null;
    status: string;
  };
  onClick: (id: string) => void;
}

const PatientCard = ({ patient, onClick }: PatientCardProps) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={() => onClick(patient.id)}
      className="w-full text-left p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{patient.full_name}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {patient.room && (
                <span className="flex items-center gap-1">
                  <BedDouble className="h-3 w-3" />
                  {t('patients.room')} {patient.room}{patient.bed ? ` / ${t('patients.bed')} ${patient.bed}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
          {t(`patients.statuses.${patient.status}`)}
        </Badge>
      </div>
      {patient.diagnosis && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Stethoscope className="h-3 w-3" />
          <span className="line-clamp-1">{patient.diagnosis}</span>
        </div>
      )}
    </button>
  );
};

export default PatientCard;
