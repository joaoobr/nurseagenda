import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

const NATIVE_OAUTH_REDIRECT_URL = 'app.nurseagenda.mobile://login-callback';

/**
 * Initialize deep link handling for Capacitor.
 * When OAuth redirects back to the app via a custom URL scheme or App Link,
 * this listener captures the URL and extracts the auth tokens.
 */
export function initDeepLinkListener(navigate: (path: string) => void) {
  if (!Capacitor.isNativePlatform()) return;

  App.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
    const url = new URL(event.url);

    try {
      await Browser.close();
    } catch {
      // no-op: browser may already be closed
    }

    // Handle OAuth callback — the URL contains access_token and refresh_token
    // in the hash fragment (e.g., #access_token=...&refresh_token=...)
    if (url.hash) {
      const params = new URLSearchParams(url.hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        try {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          navigate('/');
          return;
        } catch (error) {
          console.error('Error setting session from deep link:', error);
        }
      }
    }

    // Handle regular deep links — navigate to the path
    const path = url.pathname && url.pathname !== '/' ? url.pathname : '/';
    navigate(`${path}${url.search}`);
  });
}

/**
 * Returns the correct redirect URL for OAuth based on platform.
 * On native: uses a custom scheme so Android/iOS can reliably reopen the app
 * On web: uses window.location.origin
 */
export function getOAuthRedirectUrl(): string {
  if (Capacitor.isNativePlatform()) {
    return NATIVE_OAUTH_REDIRECT_URL;
  }
  return window.location.origin;
}
