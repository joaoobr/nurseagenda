import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const About = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/more')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{t('settings.about')}</h1>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Heart className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">NurseAgenda</h2>
        <p className="text-sm text-muted-foreground">v1.0.0</p>
        <p className="text-sm text-muted-foreground">
          Sua agenda de enfermagem inteligente
        </p>
        <div className="pt-4 space-y-2 text-sm text-muted-foreground">
          <button onClick={() => navigate('/privacy')} className="block w-full text-primary hover:underline">
            {t('auth.privacyPolicy', 'Política de Privacidade')}
          </button>
          <button onClick={() => navigate('/terms')} className="block w-full text-primary hover:underline">
            {t('auth.termsOfService', 'Termos de Uso')}
          </button>
          <p className="pt-2">support@youhub.app</p>
        </div>
      </div>
    </div>
  );
};

export default About;
