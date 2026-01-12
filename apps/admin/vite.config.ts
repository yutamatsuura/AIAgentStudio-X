import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3574,
  },
  build: {
    minify: 'esbuild',
  },
  // esbuildでconsole.logとdebuggerを削除（開発時はlogger.tsを使用）
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
