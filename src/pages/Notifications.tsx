import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Notifications = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/more')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{t('settings.notifications')}</h1>
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Bell className="h-8 w-8 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm">
          {t('common.comingSoon', 'Em breve')}
        </p>
      </div>
    </div>
  );
};

export default Notifications;
