-- Create enum for hotmart subscription status
CREATE TYPE public.hotmart_status AS ENUM ('active', 'canceled', 'refunded', 'expired', 'chargeback');

-- Create hotmart_subscriptions table
CREATE TABLE public.hotmart_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  status public.hotmart_status NOT NULL DEFAULT 'active',
  transaction_id TEXT,
  subscriber_code TEXT,
  product_id TEXT,
  product_name TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE,
  next_charge_date TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_event TEXT,
  raw_event JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast email lookup (lowercased)
CREATE UNIQUE INDEX idx_hotmart_subscriptions_email ON public.hotmart_subscriptions (lower(email));
CREATE INDEX idx_hotmart_subscriptions_status ON public.hotmart_subscriptions (status);
CREATE INDEX idx_hotmart_subscriptions_transaction ON public.hotmart_subscriptions (transaction_id);

-- Enable RLS
ALTER TABLE public.hotmart_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription record (matched by email)
CREATE POLICY "Users can view own hotmart subscription"
ON public.hotmart_subscriptions
FOR SELECT
TO authenticated
USING (lower(email) = lower((auth.jwt() ->> 'email')));

-- No INSERT/UPDATE/DELETE policies for users — only service role (webhook) can write

-- Trigger to keep updated_at fresh
CREATE TRIGGER update_hotmart_subscriptions_updated_at
BEFORE UPDATE ON public.hotmart_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Helper function used by check-subscription edge function
CREATE OR REPLACE FUNCTION public.get_hotmart_access(_email TEXT)
RETURNS TABLE (
  has_access BOOLEAN,
  status public.hotmart_status,
  expires_at TIMESTAMP WITH TIME ZONE,
  product_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (s.status = 'active' AND (s.expires_at IS NULL OR s.expires_at > now())) AS has_access,
    s.status,
    s.expires_at,
    s.product_name
  FROM public.hotmart_subscriptions s
  WHERE lower(s.email) = lower(_email)
  LIMIT 1;
$$;