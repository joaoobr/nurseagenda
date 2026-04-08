import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.nurseagenda.mobile',
  appName: 'nurseagenda',
  webDir: 'dist',
  server: {
    url: 'https://nurseagenda.youhub.app?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
