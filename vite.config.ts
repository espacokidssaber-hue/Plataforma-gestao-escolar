import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cast process to any to avoid TS errors in some environments regarding .cwd()
  const currentWorkingDir = (process as any).cwd();
  const env = loadEnv(mode, currentWorkingDir, '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(currentWorkingDir, './'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString())
    }
  }
})