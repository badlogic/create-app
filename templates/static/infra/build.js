#!/usr/bin/env node
import { execSync, spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanAndCopyStaticFiles, watchStaticFiles } from './static-files.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const src = join(projectRoot, 'src');
const dist = join(projectRoot, 'dist');

/** Deletes dist, copies static resources, and builds output .css and .js files */
function build() {
  console.log('Building...');

  cleanAndCopyStaticFiles(src, dist);

  execSync(`npx tsup --config ${join(__dirname, 'tsup.config.js')}`, {
    stdio: 'inherit',
    cwd: projectRoot
  });

  execSync(`npx @tailwindcss/cli -i styles.css -o ${join(dist, 'styles.css')} --minify`, {
    stdio: 'inherit',
    cwd: src
  });

  console.log('✓ Built to dist/');
}

/** Deletes dist, copies static resources, and builds output .css and js. files in watch mode */
function watch() {
  console.log('Starting watch mode...');

  cleanAndCopyStaticFiles(src, dist);

  // Start tsup in watch mode
  spawn('npx', ['tsup', '--config', join(__dirname, 'tsup.config.js'), '--watch'], {
    stdio: 'inherit',
    cwd: projectRoot
  });

  // Start Tailwind in watch mode
  spawn('npx', ['@tailwindcss/cli', '-i', 'styles.css', '-o', join(dist, 'styles.css'), '--watch=always'], {
    stdio: 'inherit',
    cwd: src
  });


  // Watch and copy static files
  watchStaticFiles(src, dist);
}

if (process.argv.includes('--watch')) {
  watch();
} else {
  build();
}