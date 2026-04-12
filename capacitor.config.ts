import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.nurseagenda.mobile',
  appName: 'nurseagenda',
  webDir: 'dist',
  server: {
    url: 'https://nurseagenda.youhub.app?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    App: {
      // Android App Links will be configured via AndroidManifest.xml
    }
  }
};

export default config;
