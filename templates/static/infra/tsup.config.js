import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/frontend/index.ts'],
  format: ['iife'],
  outDir: 'dist',
  clean: false,
  minify: true,
  sourcemap: true,
  outExtension() {
    return {
      js: '.js', // This makes it output index.js instead of index.global.js
    }
  },
})