import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  HeartPulse,
  Lightbulb,
  MessageCircle,
  Pill,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const studyCategories = [
  { icon: HeartPulse, key: 'vitals', items: ['vitals_1', 'vitals_2', 'vitals_3'] },
  { icon: Pill, key: 'medications', items: ['medications_1', 'medications_2', 'medications_3'] },
  { icon: ShieldCheck, key: 'safety', items: ['safety_1', 'safety_2', 'safety_3'] },
  { icon: Stethoscope, key: 'procedures', items: ['procedures_1', 'procedures_2', 'procedures_3'] },
];

const quickTips = ['tip_1', 'tip_2', 'tip_3', 'tip_4'];

const usefulSites = [
  { label: 'BVS Enfermagem', url: 'https://bvsenfermeria.bvsalud.org/' },
  { label: 'COFEN', url: 'https://www.cofen.gov.br/' },
  { label: 'SciELO', url: 'https://www.scielo.br/' },
];

const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
};

const Studies = () => {
  const { t } = useTranslation();
  const dailyTips = t('studies.dailyTips.items', { returnObjects: true }) as string[];
  const dayOfYear = getDayOfYear();
  const dailyTip = dailyTips[(dayOfYear - 1) % dailyTips.length];

  return (
    <div className="px-4 pt-6 space-y-5">
      <section className="rounded-xl border border-border bg-card p-4 overflow-hidden relative">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent" />
        <div className="relative">
          <div className="flex items-center gap-2 text-primary mb-3">
            <GraduationCap className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">{t('studies.badge')}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('studies.title')}</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t('studies.subtitle')}</p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-accent p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-5 w-5 text-accent-foreground" />
          <h2 className="text-base font-bold text-accent-foreground">{t('studies.dailyTips.title')}</h2>
        </div>
        <p className="text-sm text-accent-foreground leading-relaxed">{dailyTip}</p>
        <p className="text-xs text-accent-foreground/80 mt-2">{t('studies.dailyTips.day', { day: dayOfYear })}</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {studyCategories.map((category) => {
          const Icon = category.icon;
          const details = t(`studies.categoryDetails.${category.key}.sections`, { returnObjects: true }) as Array<{
            title: string;
            items: string[];
          }>;

          return (
            <Dialog key={category.key}>
              <DialogTrigger asChild>
                <button className="rounded-xl border border-border bg-card p-4 text-left shadow-none transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-semibold leading-tight text-card-foreground">
                        {t(`studies.categories.${category.key}.title`)}
                      </h2>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                        {t(`studies.categories.${category.key}.description`)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <DialogTitle>{t(`studies.categories.${category.key}.title`)}</DialogTitle>
                  <DialogDescription>{t(`studies.categoryDetails.${category.key}.intro`)}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {details.map((section) => (
                    <section key={section.title} className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                      <div className="space-y-2">
                        {section.items.map((item) => (
                          <div key={item} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                            <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">{t('studies.summaries')}</h2>
        {studyCategories.map((category) => (
          <Card key={`${category.key}-summary`} className="rounded-xl shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">{t(`studies.categories.${category.key}.title`)}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {category.items.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                  <span>{t(`studies.content.${item}`)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-accent p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-accent-foreground" />
          <h2 className="text-lg font-bold text-accent-foreground">{t('studies.tips')}</h2>
        </div>
        <div className="space-y-2">
          {quickTips.map((tip) => (
            <p key={tip} className="text-sm text-accent-foreground leading-relaxed">• {t(`studies.quickTips.${tip}`)}</p>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">{t('studies.sites')}</h2>
        <div className="space-y-2">
          {usefulSites.map((site) => (
            <a
              key={site.url}
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground"
            >
              <span>{site.label}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
          <MessageCircle className="h-5 w-5 text-secondary" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-foreground">{t('studies.communityTitle')}</h2>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t('studies.communityDesc')}</p>
          <Button className="mt-3 gap-2" variant="secondary" size="sm" disabled>
            <BookOpen className="h-4 w-4" />
            {t('studies.communityCta')}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Studies;
