import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * OAuth Native Callback Bridge
 * 
 * Supabase redirects here (HTTPS) after OAuth completes with PKCE.
 * This function does a 302 redirect to the app's custom scheme,
 * which reliably triggers the Android/iOS deep link and reopens the app.
 *
 * Flow:
 *   Google → Supabase Auth → this edge function (HTTPS) → 302 → app.nurseagenda.mobile://login-callback?code=...
 */
serve((req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing auth code", { status: 400 });
  }

  const nativeRedirect = `app.nurseagenda.mobile://login-callback?code=${encodeURIComponent(code)}`;

  // Return an HTML page that tries the redirect via JavaScript first,
  // then falls back to a meta refresh, then shows a manual link.
  // This is more reliable than a plain 302 across all Android versions.
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="2;url=${nativeRedirect}">
  <title>Redirecting...</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
    .card { text-align: center; padding: 2rem; }
    a { color: #3B82F6; }
  </style>
</head>
<body>
  <div class="card">
    <p>Redirecionando para o app...</p>
    <p><a href="${nativeRedirect}">Toque aqui se não for redirecionado automaticamente</a></p>
  </div>
  <script>
    window.location.href = "${nativeRedirect}";
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
