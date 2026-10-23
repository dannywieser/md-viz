import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'electron-vite'

export default defineConfig({
  main: {
    build: {
      // the api client is typescript source, so main bundles it instead of requiring it.
      externalizeDeps: { exclude: ['@md-viz/api-client'] },
    },
  },
  preload: {
    build: {
      // sandboxed preload scripts must be commonjs.
      rollupOptions: {
        output: { format: 'cjs', entryFileNames: '[name].cjs' },
      },
    },
  },
  renderer: {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src/renderer/src'),
      },
    },
  },
})
