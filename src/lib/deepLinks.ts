import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = 'https://igylprpvqunjpfsagnkr.supabase.co';
const NATIVE_OAUTH_BRIDGE_URL = `${SUPABASE_URL}/functions/v1/oauth-native-callback`;
const NATIVE_OAUTH_CALLBACK_HOST = 'login-callback';

function isNativeOAuthCallback(url: URL) {
  return url.protocol === 'app.nurseagenda.mobile:' && url.host === NATIVE_OAUTH_CALLBACK_HOST;
}

function getDeepLinkPath(url: URL) {
  if (url.pathname && url.pathname !== '/') {
    return `${url.pathname}${url.search}`;
  }

  if (
    url.protocol !== 'http:' &&
    url.protocol !== 'https:' &&
    url.host &&
    url.host !== NATIVE_OAUTH_CALLBACK_HOST
  ) {
    return `/${url.host}${url.search}`;
  }

  return url.search ? `/${url.search}` : '/';
}

/**
 * Initialize deep link handling for Capacitor.
 * When OAuth redirects back to the app via a custom URL scheme or App Link,
 * this listener captures the URL and extracts the auth tokens.
 */
export function initDeepLinkListener(navigate: (path: string) => void) {
  if (!Capacitor.isNativePlatform()) return;

  App.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
    let url: URL;

    try {
      url = new URL(event.url);
    } catch (error) {
      console.error('Invalid deep link URL:', event.url, error);
      return;
    }

    try {
      await Browser.close();
    } catch {
      // no-op: browser may already be closed
    }

    const code = url.searchParams.get('code');

    if (isNativeOAuthCallback(url) && code) {
      try {
        await supabase.auth.exchangeCodeForSession(code);
        navigate('/');
        return;
      } catch (error) {
        console.error('Error exchanging auth code from deep link:', error);
      }
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
    navigate(getDeepLinkPath(url));
  });
}

/**
 * Returns the correct redirect URL for OAuth based on platform.
 * On native: uses a custom scheme so Android/iOS can reliably reopen the app
 * On web: uses window.location.origin
 */
export function getOAuthRedirectUrl(): string {
  if (Capacitor.isNativePlatform()) {
    return NATIVE_OAUTH_BRIDGE_URL;
  }
  return window.location.origin;
}
