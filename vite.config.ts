import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

declare const process: { env: Record<string, string | undefined> }

export default defineConfig({
  // GitHub Pages hosts this project under /HaoTrace/.
  // Keep local development and other hosts at the domain root.
  base: process.env.GITHUB_ACTIONS ? '/HaoTrace/' : '/',
  plugins: [react()],
})
