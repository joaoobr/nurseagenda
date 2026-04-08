import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/LanguageSelector';

const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/more')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{t('common.settings')}</h1>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl bg-card border border-border p-4">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            {t('settings.language')}
          </label>
          <LanguageSelector />
        </div>

        <div className="rounded-xl bg-card border border-border p-4">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            {t('settings.theme')}
          </label>
          <p className="text-sm text-muted-foreground">
            {t('common.comingSoon', 'Em breve')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
