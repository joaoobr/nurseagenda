import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Sunset, Moon, Coffee, MapPin, Building2 } from 'lucide-react';

interface Shift {
  id: string;
  title: string;
  shift_type: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  sector: string | null;
  notes: string | null;
  is_day_off: boolean;
}

interface ShiftCardProps {
  shift: Shift;
  onClick: () => void;
}

const SHIFT_ICONS: Record<string, React.ElementType> = {
  morning: Sun,
  afternoon: Sunset,
  night: Moon,
};

const SHIFT_COLORS: Record<string, string> = {
  morning: 'bg-amber-100 text-amber-800 border-amber-200',
  afternoon: 'bg-orange-100 text-orange-800 border-orange-200',
  night: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const ShiftCard = ({ shift, onClick }: ShiftCardProps) => {
  const { t } = useTranslation();

  if (shift.is_day_off) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200 bg-green-50" onClick={onClick}>
        <CardContent className="p-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
            <Coffee className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-green-800 truncate">{shift.title}</p>
            <p className="text-xs text-green-600">{t('schedule.dayOff')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const Icon = SHIFT_ICONS[shift.shift_type] || Sun;
  const colorClass = SHIFT_COLORS[shift.shift_type] || SHIFT_COLORS.morning;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-full flex items-center justify-center ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{shift.title}</p>
            <p className="text-xs text-muted-foreground">
              {shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}
            </p>
          </div>
          <Badge variant="outline" className={`text-xs ${colorClass}`}>
            {t(`schedule.${shift.shift_type}`)}
          </Badge>
        </div>
        {(shift.location || shift.sector) && (
          <div className="flex gap-3 mt-2 ml-12 text-xs text-muted-foreground">
            {shift.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {shift.location}
              </span>
            )}
            {shift.sector && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {shift.sector}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShiftCard;
