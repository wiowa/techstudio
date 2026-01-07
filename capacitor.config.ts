import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tech.wiowa.mymemory',
  appName: 'MyMemory',
  webDir: 'dist/apps/mymemory-mobile',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
