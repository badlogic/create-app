#!/usr/bin/env node
import { execSync, spawn } from 'node:child_process';
import { cpSync, existsSync, watch as fsWatch, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const src = join(projectRoot, 'src');
const dist = join(projectRoot, 'dist');

/** Deletes dist/ and copies static resources */
function cleanAndCopyStaticFiles() {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  cpSync(src, dist, {
    recursive: true,
    filter: (source) => {

      return !source.endsWith('.ts') &&
             !source.endsWith('.tsx') &&
             !source.endsWith('.js') &&
             !source.endsWith('.jsx') &&
             !source.endsWith('.css') ||
             source === src;
    }
  });
}

/** Deletes dist, copies static resources, and builds output .css and .js files */
function build() {
  console.log('Building...');

  cleanAndCopyStaticFiles();

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

  cleanAndCopyStaticFiles();

  spawn('npx', ['tsup', '--config', join(__dirname, 'tsup.config.js'), '--watch'], {
    stdio: 'inherit',
    cwd: projectRoot
  });


    spawn('npx', ['@tailwindcss/cli', '-i', 'styles.css', '-o', join(dist, 'styles.css'), '--watch=always'], {
      stdio: 'inherit',
      cwd: src
    });


  fsWatch(src, { recursive: true }, (eventType, filename) => {
    if (!filename || filename.endsWith('.ts') || filename.endsWith('.js') || filename.endsWith('.css')) {
      return;
    }

    const srcPath = join(src, filename);
    const destPath = join(dist, filename);

    if (eventType === 'rename') {
      if (existsSync(srcPath)) {

        console.log(`Copying: ${filename}`);
        const destDir = dirname(destPath);
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        cpSync(srcPath, destPath);
      } else {

        console.log(`Removing: ${filename}`);
        if (existsSync(destPath)) {
          rmSync(destPath, { force: true });
        }
      }
    } else if (eventType === 'change') {

      console.log(`Updating: ${filename}`);
      cpSync(srcPath, destPath);
    }
  });
}


if (process.argv.includes('--watch')) {
  watch();
} else {
  build();
}