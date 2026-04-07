import { useTranslation } from 'react-i18next';

const Schedule = () => {
  const { t } = useTranslation();
  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">{t('schedule.title')}</h1>
      <div className="flex items-center justify-center h-60 rounded-xl border border-dashed border-border">
        <p className="text-muted-foreground text-sm">{t('schedule.noShifts')}</p>
      </div>
    </div>
  );
};

export default Schedule;
