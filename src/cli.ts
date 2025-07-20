#!/usr/bin/env node

import chalk from 'chalk';
import { createApp } from './index.js';

async function main() {
  const args = process.argv.slice(2);
  const projectName = args[0];

  if (!projectName) {
    console.error(chalk.red('Error: Project name is required'));
    console.log(chalk.dim('Usage: npx @mariozechner/create-app <project-name>'));
    process.exit(1);
  }

  // Validate project name
  if (!/^[a-zA-Z0-9-_]+$/.test(projectName)) {
    console.error(chalk.red('Error: Project name can only contain letters, numbers, hyphens, and underscores'));
    console.log(chalk.dim('Examples: my-app, myapp, my_app, webapp123'));
    process.exit(1);
  }

  try {
    await createApp(projectName);
  } catch (error) {
    console.error(chalk.red('Error creating app:'), error);
    process.exit(1);
  }
}

main();