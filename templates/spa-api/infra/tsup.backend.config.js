import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/backend/server.ts'],
  format: ['esm'],
  outDir: 'dist/backend',
  clean: false,
  minify: false,
  sourcemap: true,
  target: 'node18',
  platform: 'node',
})