import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, HeartPulse, Pill, ShieldCheck, Stethoscope } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const studyTopics = [
  { key: 'vitals', icon: HeartPulse },
  { key: 'medications', icon: Pill },
  { key: 'safety', icon: ShieldCheck },
  { key: 'procedures', icon: Stethoscope },
] as const;

type StudyTopicKey = (typeof studyTopics)[number]['key'];

type TopicSection = {
  title: string;
  items: string[];
};

const isStudyTopicKey = (value: string | undefined): value is StudyTopicKey =>
  studyTopics.some((topic) => topic.key === value);

const StudyTopic = () => {
  const { topic } = useParams();
  const { t } = useTranslation();

  if (!isStudyTopicKey(topic)) {
    return <Navigate to="/studies" replace />;
  }

  const currentIndex = studyTopics.findIndex((item) => item.key === topic);
  const currentTopic = studyTopics[currentIndex];
  const previousTopic = studyTopics[(currentIndex - 1 + studyTopics.length) % studyTopics.length];
  const nextTopic = studyTopics[(currentIndex + 1) % studyTopics.length];
  const Icon = currentTopic.icon;
  const sections = t(`studies.categoryDetails.${topic}.sections`, { returnObjects: true }) as TopicSection[];

  return (
    <div className="px-4 pt-6 space-y-5">
      <Button asChild variant="ghost" className="-ml-3 gap-2">
        <Link to="/studies">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">{t('studies.title')}</p>
        <h1 className="text-2xl font-bold text-foreground">{t(`studies.categories.${topic}.title`)}</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t(`studies.categoryDetails.${topic}.intro`)}</p>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        {studyTopics.map((item) => {
          const TopicIcon = item.icon;
          const isActive = item.key === topic;
          return (
            <Link
              key={item.key}
              to={`/studies/${item.key}`}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <TopicIcon className="h-4 w-4" />
              {t(`studies.categories.${item.key}.title`)}
            </Link>
          );
        })}
      </section>

      <section className="space-y-3">
        {sections.map((section) => (
          <Card key={section.title} className="rounded-xl shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {section.items.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="justify-start gap-2 h-auto py-3">
          <Link to={`/studies/${previousTopic.key}`}>
            <ChevronLeft className="h-4 w-4" />
            <span className="truncate">{t(`studies.categories.${previousTopic.key}.title`)}</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-end gap-2 h-auto py-3">
          <Link to={`/studies/${nextTopic.key}`}>
            <span className="truncate">{t(`studies.categories.${nextTopic.key}.title`)}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
};

export default StudyTopic;
