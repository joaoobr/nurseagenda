import { useAuth } from '@/contexts/AuthContext';
import Paywall from '@/components/Paywall';
import { ReactNode } from 'react';

interface SubscriptionGateProps {
  children: ReactNode;
}

const SubscriptionGate = ({ children }: SubscriptionGateProps) => {
  const { hasAccess, subscriptionLoading } = useAuth();

  if (subscriptionLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return <Paywall />;
  }

  return <>{children}</>;
};

export default SubscriptionGate;
