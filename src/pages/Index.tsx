import { useTranslation } from 'react-i18next';
import { Calendar, Users, Pill, Calculator, ClipboardList, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Calendar,
      label: t('nav.schedule'),
      description: t('schedule.title'),
      path: '/schedule',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Users,
      label: t('nav.patients'),
      description: t('patients.title'),
      path: '/patients',
      color: 'bg-secondary/10 text-secondary',
    },
    {
      icon: Pill,
      label: t('nav.medications'),
      description: t('medications.title'),
      path: '/medications',
      color: 'bg-warning/10 text-warning',
    },
    {
      icon: Activity,
      label: t('patients.vitalSigns'),
      description: t('vitals.bloodPressure'),
      path: '/patients',
      color: 'bg-destructive/10 text-destructive',
    },
    {
      icon: Calculator,
      label: t('medications.calculator'),
      description: t('calculator.title'),
      path: '/calculator',
      color: 'bg-accent text-accent-foreground',
    },
    {
      icon: ClipboardList,
      label: 'Checklists',
      description: t('common.noData'),
      path: '/checklists',
      color: 'bg-muted text-muted-foreground',
    },
  ];

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('app.name')}</h1>
          <p className="text-sm text-muted-foreground">{t('app.tagline')}</p>
        </div>
        <LanguageSelector />
      </div>

      {/* Welcome card */}
      <div className="rounded-xl bg-primary p-5 mb-6 text-primary-foreground">
        <p className="text-sm font-medium opacity-90">{t('auth.welcomeBack')}</p>
        <p className="text-xl font-bold mt-1">Enfermeira</p>
        <p className="text-xs opacity-75 mt-2">
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.path + action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-start gap-3 p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className={`p-2.5 rounded-lg ${action.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Index;
