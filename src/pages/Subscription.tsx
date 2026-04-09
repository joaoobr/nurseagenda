import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { STRIPE_PLANS, getPlanByPriceId } from '@/config/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const Subscription = () => {
  const { t } = useTranslation();
  const { subscription, subscriptionLoading, checkSubscription } = useAuth();
  const [searchParams] = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const [pollingSub, setPollingSub] = useState(false);

  // Poll aggressively after successful checkout to detect new subscription
  useEffect(() => {
    if (searchParams.get('success') === 'true' && !subscription.subscribed) {
      setPollingSub(true);
      let cancelled = false;
      let attempts = 0;
      const MAX_ATTEMPTS = 15;

      const poll = async () => {
        while (!cancelled && attempts < MAX_ATTEMPTS) {
          attempts++;
          await checkSubscription();
          await new Promise(r => setTimeout(r, 2000));
        }
        if (!cancelled) setPollingSub(false);
      };
      poll();
      return () => { cancelled = true; };
    } else if (searchParams.get('success') === 'true' && subscription.subscribed) {
      setPollingSub(false);
    } else if (searchParams.get('canceled') === 'true') {
      toast.info(t('subscription.canceled'));
    }
  }, [searchParams, checkSubscription, t, subscription.subscribed]);

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      console.log('Starting checkout with priceId:', priceId);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });
      console.log('Checkout response:', data, error);
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error(err.message || t('common.error'));
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || t('common.error'));
    } finally {
      setPortalLoading(false);
    }
  };

  const currentPlan = subscription.priceId ? getPlanByPriceId(subscription.priceId) : null;

  const plans = [
    {
      key: 'monthly',
      name: t('subscription.monthly'),
      price: `$${STRIPE_PLANS.monthly.price.toFixed(2)}`,
      period: t('subscription.perMonth'),
      priceId: STRIPE_PLANS.monthly.priceId,
      features: [
        t('subscription.features.allModules'),
        t('subscription.features.unlimitedPatients'),
        t('subscription.features.checklists'),
        t('subscription.features.vitalSigns'),
        t('subscription.features.calculator'),
      ],
    },
    {
      key: 'annual',
      name: t('subscription.annual'),
      price: `$${STRIPE_PLANS.annual.price.toFixed(2)}`,
      period: t('subscription.perYear'),
      priceId: STRIPE_PLANS.annual.priceId,
      popular: true,
      savings: t('subscription.savings'),
      features: [
        t('subscription.features.allModules'),
        t('subscription.features.unlimitedPatients'),
        t('subscription.features.checklists'),
        t('subscription.features.vitalSigns'),
        t('subscription.features.calculator'),
        t('subscription.features.priority'),
      ],
    },
  ];

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

      {pollingSub && !subscription.subscribed && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-foreground">{t('subscription.syncing')}</p>
          </CardContent>
        </Card>
      )}

      {subscription.subscribed && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t('subscription.activePlan')}: {currentPlan === 'annual' ? t('subscription.annual') : t('subscription.monthly')}
              </p>
              {subscription.subscriptionEnd && (
                <p className="text-xs text-muted-foreground">
                  {t('subscription.renewsAt')} {new Date(subscription.subscriptionEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={portalLoading}>
              {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-1" />}
              {t('subscription.manage')}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.key;
          return (
            <Card key={plan.key} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  {t('subscription.popular')}
                </Badge>
              )}
              {isCurrentPlan && (
                <Badge variant="outline" className="absolute -top-2.5 right-4 border-primary text-primary">
                  {t('subscription.yourPlan')}
                </Badge>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/{plan.period}</span>
                </div>
                {plan.savings && (
                  <CardDescription className="text-xs text-green-600 font-medium">{plan.savings}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrentPlan ? (
                  <Button className="w-full" variant="outline" disabled>
                    {t('subscription.currentPlan')}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleCheckout(plan.priceId)}
                    disabled={!!checkoutLoading}
                  >
                    {checkoutLoading === plan.priceId ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {subscription.subscribed ? t('subscription.changePlan') : t('subscription.subscribe')}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Subscription;
