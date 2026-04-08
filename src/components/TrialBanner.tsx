import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Crown } from 'lucide-react';

const TrialBanner = () => {
  const { t } = useTranslation();
  const { trialDaysLeft, isTrialExpired, subscription, subscriptionLoading } = useAuth();
  const navigate = useNavigate();

  if (subscriptionLoading || subscription.subscribed || isTrialExpired) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/subscription')}
      className="w-full bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 flex items-center gap-2 text-left hover:bg-primary/15 transition-colors"
    >
      <Crown className="h-4 w-4 text-primary flex-shrink-0" />
      <span className="text-xs text-foreground font-medium flex-1">
        {t('paywall.trialBanner', { days: trialDaysLeft })}
      </span>
      <span className="text-xs text-primary font-semibold whitespace-nowrap">
        {t('paywall.ctaShort')}
      </span>
    </button>
  );
};

export default TrialBanner;
