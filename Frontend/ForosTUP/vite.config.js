import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const { API_PROXY_TARGET } = loadEnv(mode, process.cwd(), '');
  const proxy = {
    '/api': {
      target: API_PROXY_TARGET || 'http://localhost:5073',
      changeOrigin: true,
      rewrite: (path) => /^\/api\/auth(?:\/|\?|$)/i.test(path)
        ? path
        : path.replace(/^\/api/, ''),
    },
  };

  return { plugins: [react()], server: { proxy }, preview: { proxy } };
});
