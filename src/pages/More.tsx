import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import { Settings as SettingsIcon, User, Bell, Info } from 'lucide-react';

const More = () => {
  const { t } = useTranslation();

  const menuItems = [
    { icon: User, label: t('common.profile'), path: '/profile' },
    { icon: SettingsIcon, label: t('common.settings'), path: '/settings' },
    { icon: Bell, label: t('settings.notifications'), path: '/notifications' },
    { icon: Info, label: t('settings.about'), path: '/about' },
  ];

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">{t('settings.title')}</h1>

      <div className="mb-6">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          {t('settings.language')}
        </label>
        <LanguageSelector />
      </div>

      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default More;
