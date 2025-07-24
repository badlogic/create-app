#!/usr/bin/env node
import { execSync, spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const buildConfig = JSON.parse(readFileSync(join(projectRoot, 'build.json'), 'utf8'));

function build() {
  console.log('Building...');
  
  for (const command of buildConfig.build) {
    execSync(command.join(' '), { stdio: 'inherit', cwd: projectRoot });
  }
  
  console.log('✓ Built successfully');
}

function watch() {
  console.log('Starting watch mode...');
  
  for (const command of buildConfig.watch) {
    spawn(command[0], command.slice(1), { stdio: 'inherit', cwd: projectRoot });
  }
}

if (process.argv.includes('--watch')) {
  watch();
} else {
  build();
}