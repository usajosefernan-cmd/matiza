import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('dev') || process.argv.includes('--port');
const baseRoute = isDev ? '/' : (process.env.PUBLIC_BASE_PATH || env.PUBLIC_BASE_PATH || '/pro/matiza');

// https://astro.build/config
export default defineConfig({
  site: 'https://143-47-35-167.sslip.io',
  base: baseRoute,
  integrations: [],
  vite: {
    server: {
      watch: {
        ignored: ['**/data/**', '**/*.db', '**/*.db-journal', '**/*.db-wal', '**/*.db-shm']
      }
    }
  }
});