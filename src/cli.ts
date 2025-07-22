#!/usr/bin/env node

import chalk from 'chalk';
import { createApp } from './index.js';

function parseArgs(args: string[]): { projectName?: string; template?: string; config?: Record<string, any>; help?: boolean } {
  const result: { projectName?: string; template?: string; config?: Record<string, any>; help?: boolean } = {
    config: {}
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--template' || arg === '-t') {
      result.template = args[++i];
    } else if (arg.startsWith('--')) {
      // Handle --key=value or --key value
      const [key, value] = arg.includes('=') ? arg.split('=', 2) : [arg, args[++i]];
      const configKey = key.replace(/^--/, '');
      
      // Try to parse as number, otherwise keep as string
      const parsedValue = !isNaN(Number(value)) && value !== '' ? Number(value) : value;
      result.config![configKey] = parsedValue;
    } else if (!result.projectName) {
      result.projectName = arg;
    }
  }

  return result;
}

function showHelp() {
  console.log(chalk.blue('Create App - CLI for creating deployable web applications'));
  console.log();
  console.log(chalk.bold('Usage:'));
  console.log('  npx @mariozechner/create-app <project-name> [options]');
  console.log();
  console.log(chalk.bold('Options:'));
  console.log('  -t, --template <name>     Template to use (static, frontend-api, fullstack)');
  console.log('  --domain <domain>         Domain for the app (e.g. myapp.com)');
  console.log('  --server <server>         Production server hostname');
  console.log('  --serverDir <path>        Server directory path');
  console.log('  --frontendPort <port>     Frontend development port');
  console.log('  --apiPort <port>          API development port');
  console.log('  -h, --help                Show this help message');
  console.log();
  console.log(chalk.bold('Examples:'));
  console.log('  npx @mariozechner/create-app my-blog');
  console.log('  npx @mariozechner/create-app my-app --template frontend-api --domain myapp.com');
  console.log('  npx @mariozechner/create-app api-server -t frontend-api --domain api.example.com --server myserver.com');
}

async function main() {
  const args = process.argv.slice(2);
  const parsed = parseArgs(args);

  if (parsed.help) {
    showHelp();
    process.exit(0);
  }

  if (!parsed.projectName) {
    console.error(chalk.red('Error: Project name is required'));
    console.log(chalk.dim('Usage: npx @mariozechner/create-app <project-name> [options]'));
    console.log(chalk.dim('Use --help for more information'));
    process.exit(1);
  }

  // Validate project name
  if (!/^[a-zA-Z0-9-_]+$/.test(parsed.projectName)) {
    console.error(chalk.red('Error: Project name can only contain letters, numbers, hyphens, and underscores'));
    console.log(chalk.dim('Examples: my-app, myapp, my_app, webapp123'));
    process.exit(1);
  }

  try {
    await createApp(parsed.projectName, { 
      template: parsed.template,
      config: parsed.config 
    });
  } catch (error) {
    console.error(chalk.red('Error creating app:'), error);
    process.exit(1);
  }
}

main();