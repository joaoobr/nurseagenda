import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSelector from '@/components/LanguageSelector';
import { Settings as SettingsIcon, User, Bell, Info, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const More = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: User, label: t('common.profile'), path: '/profile' },
    { icon: SettingsIcon, label: t('common.settings'), path: '/settings' },
    { icon: Bell, label: t('settings.notifications'), path: '/notifications' },
    { icon: Info, label: t('settings.about'), path: '/about' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">{t('settings.title')}</h1>

      {/* User info */}
      {user && (
        <div className="rounded-xl bg-card border border-border p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      )}

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
              onClick={() => item.path && navigate(item.path)}
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <Button
          variant="outline"
          className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {t('auth.logout')}
        </Button>
      </div>
    </div>
  );
};

export default More;
