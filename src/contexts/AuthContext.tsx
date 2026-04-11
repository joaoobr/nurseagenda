import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const TRIAL_DAYS = 3;

interface SubscriptionInfo {
  subscribed: boolean;
  productId: string | null;
  priceId: string | null;
  subscriptionEnd: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionInfo;
  subscriptionLoading: boolean;
  trialDaysLeft: number;
  isTrialExpired: boolean;
  hasAccess: boolean; // true if subscribed OR within trial
  checkSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultSubscription: SubscriptionInfo = {
  subscribed: false,
  productId: null,
  priceId: null,
  subscriptionEnd: null,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  subscription: defaultSubscription,
  subscriptionLoading: true,
  trialDaysLeft: TRIAL_DAYS,
  isTrialExpired: false,
  hasAccess: true,
  checkSubscription: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function calcTrialDaysLeft(user: User | null): number {
  if (!user?.created_at) return TRIAL_DAYS;
  const created = new Date(user.created_at).getTime();
  const now = Date.now();
  const elapsed = (now - created) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsed));
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(defaultSubscription);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscription({
        subscribed: data?.subscribed ?? false,
        productId: data?.product_id ?? null,
        priceId: data?.price_id ?? null,
        subscriptionEnd: data?.subscription_end ?? null,
      });
    } catch (err) {
      console.error('Error checking subscription:', err);
      setSubscription(defaultSubscription);
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          setTimeout(() => checkSubscription(), 0);
        } else {
          setSubscription(defaultSubscription);
          setSubscriptionLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkSubscription();
      } else {
        setSubscriptionLoading(false);
      }
    });

    return () => authSub.unsubscribe();
  }, [checkSubscription]);

  // Periodic check every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const isAdmin = user?.email === 'jvoliveira@gmail.com';
  const trialDaysLeft = useMemo(() => calcTrialDaysLeft(user), [user]);
  const isTrialExpired = trialDaysLeft <= 0;
  const hasAccess = isAdmin || subscription.subscribed || !isTrialExpired;

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      subscription, subscriptionLoading,
      trialDaysLeft, isTrialExpired, hasAccess,
      checkSubscription, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
