import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HealthDisclaimer = () => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg bg-muted/50 border border-border px-3 py-2.5 flex items-start gap-2">
      <ShieldAlert className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {t('disclaimer.healthData')}
      </p>
    </div>
  );
};

export default HealthDisclaimer;