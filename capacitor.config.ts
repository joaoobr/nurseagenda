import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5c2ab7bed38a48abbd838d57c8e50956',
  appName: 'nurseagenda',
  webDir: 'dist',
  server: {
    url: 'https://nurseagenda.youhub.app?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
