import { useTranslation } from 'react-i18next';
import { Calendar, Users, Pill, Calculator, ClipboardList, Activity, Search, Heart, Lightbulb, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';
import { fetchDailyQuote, fetchDailyTip } from '@/services/dailyContent';
import { getDailyQuote, getDailyTip } from '@/data/motivationalQuotes';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const Index = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quote, setQuote] = useState(() => getDailyQuote(i18n.language));
  const [tip, setTip] = useState(() => getDailyTip(i18n.language));
  const [todayShifts, setTodayShifts] = useState(0);
  const [pendingMeds, setPendingMeds] = useState(0);
  const [activePatients, setActivePatients] = useState(0);

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;

    const fetchCounts = async () => {
      const [shiftsRes, medsRes, patientsRes] = await Promise.all([
        supabase.from('shifts').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('shift_date', today),
        supabase.from('medications').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('status', 'pending'),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('status', 'active'),
      ]);
      setTodayShifts(shiftsRes.count ?? 0);
      setPendingMeds(medsRes.count ?? 0);
      setActivePatients(patientsRes.count ?? 0);
    };

    fetchCounts();
  }, [user, today]);

  useEffect(() => {
    // Try Supabase first, fall back to local data
    const lang = i18n.language;
    fetchDailyQuote(lang).then((q) => { if (q) setQuote(q); });
    fetchDailyTip(lang).then((t) => { if (t) setTip(t); });
  }, [i18n.language]);

  // Update local fallback when language changes
  useEffect(() => {
    setQuote(getDailyQuote(i18n.language));
    setTip(getDailyTip(i18n.language));
  }, [i18n.language]);

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
    <div className="px-4 pt-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('app.name')}</h1>
          <p className="text-sm text-muted-foreground">{t('app.tagline')}</p>
        </div>
        <LanguageSelector />
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={t('home.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
      </div>

      {/* Motivational message */}
      <div className="rounded-xl bg-gradient-to-br from-primary to-secondary p-5 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-3 right-3 opacity-20">
          <Heart className="h-16 w-16" fill="currentColor" />
        </div>
        <p className="text-sm font-medium opacity-90 mb-1">
          {t('auth.welcomeBack')}, {user?.user_metadata?.full_name || user?.user_metadata?.name || t('nav.home')} 👋
        </p>
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
            {t('home.motivationalTitle')}
          </p>
        </div>
        <p className="text-sm font-medium leading-relaxed pr-12">
          {quote}
        </p>
        <p className="text-xs opacity-75 mt-3">
          {new Date().toLocaleDateString(i18n.language, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Today's summary */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">{t('home.todaySummary')}</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-[10px] text-muted-foreground mt-1">{t('home.shifts')}</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <p className="text-2xl font-bold text-warning">0</p>
            <p className="text-[10px] text-muted-foreground mt-1">{t('home.pendingMeds')}</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3 text-center">
            <p className="text-2xl font-bold text-secondary">0</p>
            <p className="text-[10px] text-muted-foreground mt-1">{t('home.activePatients')}</p>
          </div>
        </div>
      </div>

      {/* Nursing tip of the day */}
      <div className="rounded-xl bg-accent/50 border border-accent p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-accent">
            <Lightbulb className="h-4 w-4 text-accent-foreground" />
          </div>
          <p className="text-xs font-semibold text-accent-foreground uppercase tracking-wider">
            {t('home.tipTitle')}
          </p>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          {tip}
        </p>
      </div>

      {/* Quick actions grid */}
      <div>
        <div className="grid grid-cols-2 gap-3 pb-4">
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
    </div>
  );
};

export default Index;
