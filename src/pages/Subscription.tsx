import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, ExternalLink, RefreshCw, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Subscription = () => {
  const { t } = useTranslation();
  const { subscription, subscriptionLoading, checkSubscription, user } = useAuth();
  const [polling, setPolling] = useState(false);
  const [hotmartUrl, setHotmartUrl] = useState<string>('');

  useEffect(() => {
    supabase.functions.invoke('get-hotmart-link').then(({ data }) => {
      if (data?.url) setHotmartUrl(data.url);
    }).catch(() => {});
  }, []);

  // Auto-poll for activation after the user returns from Hotmart checkout
  useEffect(() => {
    if (subscription.subscribed) return;
    setPolling(true);
    let cancelled = false;
    let attempts = 0;
    const run = async () => {
      while (!cancelled && attempts < 6) {
        attempts++;
        await checkSubscription();
        await new Promise(r => setTimeout(r, 5000));
      }
      if (!cancelled) setPolling(false);
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const features = [
    t('subscription.features.allModules'),
    t('subscription.features.unlimitedPatients'),
    t('subscription.features.checklists'),
    t('subscription.features.vitalSigns'),
    t('subscription.features.calculator'),
    t('subscription.features.priority'),
  ];

  const handleBuy = () => {
    if (!hotmartUrl) return;
    // Pre-fill buyer email when possible (Hotmart honors ?email=)
    const url = new URL(hotmartUrl);
    if (user?.email) url.searchParams.set('email', user.email);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" />
          {t('subscription.title')}
        </h1>
        <Button variant="ghost" size="icon" onClick={checkSubscription} disabled={subscriptionLoading}>
          <RefreshCw className={`h-4 w-4 ${subscriptionLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{t('subscription.subtitle')}</p>

      {subscription.subscribed ? (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-semibold text-foreground">
              {t('subscription.activePlan')}: {subscription.productName ?? 'NurseAgenda Pro'}
            </p>
            {subscription.nextChargeDate && (
              <p className="text-xs text-muted-foreground mt-1">
                {t('subscription.renewsAt')} {new Date(subscription.nextChargeDate).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {polling && (
            <Card className="mb-6 border-primary/30 bg-primary/5">
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-foreground">{t('subscription.syncing')}</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-primary shadow-lg mb-4">
            <CardHeader>
              <CardTitle className="text-lg">NurseAgenda Pro</CardTitle>
              <CardDescription>{t('subscription.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleBuy}
                disabled={!hotmartUrl}
              >
                <ExternalLink className="h-4 w-4" />
                {t('subscription.subscribe')}
              </Button>

              <div className="mt-4 p-3 rounded-lg bg-primary/5 border-2 border-primary/30 flex gap-2 items-start">
                <Mail className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-xs text-foreground leading-relaxed">
                  <p className="font-semibold mb-1">{t('subscription.hotmartWarningTitle')}</p>
                  <p className="text-muted-foreground">
                    {t('subscription.hotmartWarningBody', { email: user?.email ?? '' })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Subscription;
