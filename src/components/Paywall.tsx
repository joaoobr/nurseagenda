import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Paywall = () => {
  const { t } = useTranslation();
  const { trialDaysLeft, isTrialExpired, subscription, subscriptionLoading } = useAuth();
  const navigate = useNavigate();

  if (subscriptionLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Has access — show nothing
  if (subscription.subscribed || !isTrialExpired) {
    return null;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            {t('paywall.title')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('paywall.description')}
          </p>
        </div>

        <Button
          size="lg"
          className="w-full gap-2 text-base"
          onClick={() => navigate('/subscription')}
        >
          <Crown className="h-5 w-5" />
          {t('paywall.cta')}
        </Button>

        <p className="text-xs text-muted-foreground">
          {t('paywall.hint')}
        </p>
      </div>
    </div>
  );
};

export default Paywall;
