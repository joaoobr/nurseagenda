import { supabase } from '@/integrations/supabase/client';

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export async function fetchDailyQuote(language: string): Promise<string | null> {
  const dayOfYear = getDayOfYear();

  // Get total count for this language
  const { count } = await supabase
    .from('motivational_quotes')
    .select('*', { count: 'exact', head: true })
    .eq('language', language);

  if (!count) return null;

  const index = dayOfYear % count;

  const { data } = await supabase
    .from('motivational_quotes')
    .select('quote')
    .eq('language', language)
    .order('sort_order', { ascending: true })
    .range(index, index);

  return data?.[0]?.quote ?? null;
}

export async function fetchDailyTip(language: string): Promise<string | null> {
  const dayOfYear = getDayOfYear();

  const { count } = await supabase
    .from('nursing_tips')
    .select('*', { count: 'exact', head: true })
    .eq('language', language);

  if (!count) return null;

  const index = dayOfYear % count;

  const { data } = await supabase
    .from('nursing_tips')
    .select('tip')
    .eq('language', language)
    .order('sort_order', { ascending: true })
    .range(index, index);

  return data?.[0]?.tip ?? null;
}
