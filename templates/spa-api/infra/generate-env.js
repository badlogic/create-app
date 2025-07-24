#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const envVarsFile = join(projectRoot, 'env.vars');
const envFile = join(projectRoot, '.env');

if (!existsSync(envVarsFile)) {
  console.log('No env.vars file found, skipping .env generation');
  process.exit(0);
}

const envVars = readFileSync(envVarsFile, 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'));

if (envVars.length === 0) {
  console.log('No environment variables defined in env.vars, creating empty .env');
  writeFileSync(envFile, '# No environment variables defined\n');
  process.exit(0);
}

const envContent = envVars
  .map(varName => {
    const value = process.env[varName];
    if (!value) {
      console.warn(`Warning: Environment variable ${varName} not set`);
      return `# ${varName}=`;
    }
    return `${varName}=${value}`;
  })
  .join('\n');

writeFileSync(envFile, envContent + '\n');
console.log(`Generated .env file with ${envVars.length} variables`);