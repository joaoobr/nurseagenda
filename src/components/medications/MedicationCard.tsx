import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pill, Clock, User } from 'lucide-react';
import { calculateScheduledTimes, parseFrequencyToHours, formatFrequencyLabel } from '@/utils/medicationSchedule';

interface Medication {
  id: string;
  medication_name: string;
  dose: string;
  route: string;
  frequency: string;
  scheduled_time: string | null;
  status: string;
  notes: string | null;
  patients?: { full_name: string } | null;
}

interface MedicationCardProps {
  medication: Medication;
  onClick: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  administered: 'bg-green-100 text-green-800 border-green-200',
  suspended: 'bg-red-100 text-red-800 border-red-200',
};

const MedicationCard = ({ medication, onClick }: MedicationCardProps) => {
  const { t } = useTranslation();
  const statusStyle = STATUS_STYLES[medication.status] || STATUS_STYLES.pending;

  const intervalHours = parseFrequencyToHours(medication.frequency);
  const scheduledTimes = medication.scheduled_time && intervalHours
    ? calculateScheduledTimes(medication.scheduled_time.slice(0, 5), intervalHours)
    : medication.scheduled_time ? [medication.scheduled_time.slice(0, 5)] : [];

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Pill className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{medication.medication_name}</p>
            <p className="text-xs text-muted-foreground">
              {medication.dose} — {t(`medications.routes.${medication.route}`)}
            </p>
          </div>
          <Badge variant="outline" className={`text-xs ${statusStyle}`}>
            {t(`medications.${medication.status}`)}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 ml-12 text-xs text-muted-foreground">
          {scheduledTimes.length > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {scheduledTimes.join(' • ')}
            </span>
          )}
          {medication.patients?.full_name && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" /> {medication.patients.full_name}
            </span>
          )}
          <span>{formatFrequencyLabel(medication.frequency)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationCard;
