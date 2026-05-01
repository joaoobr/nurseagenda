-- Allow admins to view, insert, update, and delete Hotmart subscriptions
CREATE POLICY "Admins can view all hotmart subscriptions"
ON public.hotmart_subscriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert hotmart subscriptions"
ON public.hotmart_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hotmart subscriptions"
ON public.hotmart_subscriptions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hotmart subscriptions"
ON public.hotmart_subscriptions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_hotmart_subscriptions_updated_at ON public.hotmart_subscriptions;
CREATE TRIGGER update_hotmart_subscriptions_updated_at
BEFORE UPDATE ON public.hotmart_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();