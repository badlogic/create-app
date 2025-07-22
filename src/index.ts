import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { isText } from 'istextorbinary';
import prompts from 'prompts';
import type { TemplateConfig } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function replaceTemplateVars(content: string, config: Record<string, any>): string {
  let result = content;

  for (const [key, value] of Object.entries(config)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  }

  return result;
}

function discoverTemplates(templatesDir: string): Array<TemplateConfig & { folderName: string }> {
  const templates: Array<TemplateConfig & { folderName: string }> = [];

  const templateDirs = fs.readdirSync(templatesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const templateDir of templateDirs) {
    const templateJsonPath = path.join(templatesDir, templateDir, 'template.json');

    if (fs.existsSync(templateJsonPath)) {
      const templateJson = JSON.parse(fs.readFileSync(templateJsonPath, 'utf8'));
      templates.push({
        folderName: templateDir,
        ...templateJson
      });
    }
  }

  return templates;
}

function isTextFile(filePath: string): boolean {
  const buffer = fs.readFileSync(filePath);
  const result = isText(filePath, buffer);
  return result === true;
}

function copyTemplateFiles(templateDir: string, destPath: string, config: Record<string, any>): void {
  function copyRecursive(srcDir: string, destDir: string, relativePath = '') {
    const items = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const item of items) {
      const srcPath = path.join(srcDir, item.name);
      const destFilePath = path.join(destDir, item.name);
      const itemRelativePath = path.join(relativePath, item.name);

      // Skip template.json
      if (item.name === 'template.json') {
        continue;
      }

      if (item.isDirectory()) {
        if (!fs.existsSync(destFilePath)) {
          fs.mkdirSync(destFilePath, { recursive: true });
        }
        copyRecursive(srcPath, destFilePath, itemRelativePath);
      } else {
        // Create directory if it doesn't exist
        const destFileDir = path.dirname(destFilePath);
        if (!fs.existsSync(destFileDir)) {
          fs.mkdirSync(destFileDir, { recursive: true });
        }

        // Get source file permissions
        const srcStats = fs.statSync(srcPath);
        
        if (isTextFile(srcPath)) {
          // Text file - apply template substitution
          let content = fs.readFileSync(srcPath, 'utf8');
          content = replaceTemplateVars(content, config);
          fs.writeFileSync(destFilePath, content);
        } else {
          // Binary file - copy as-is
          fs.copyFileSync(srcPath, destFilePath);
        }
        
        // Always preserve file permissions from template
        fs.chmodSync(destFilePath, srcStats.mode);
      }
    }
  }

  copyRecursive(templateDir, destPath);
}

export async function createApp(projectName: string, options?: { template?: string; config?: Record<string, any> }): Promise<void> {
  console.log(chalk.blue(`Creating app: ${projectName}`));
  console.log();

  // Check if directory already exists
  if (fs.existsSync(projectName)) {
    console.error(chalk.red(`Error: Directory ${projectName} already exists`));
    process.exit(1);
  }

  // Discover templates
  const templatesDir = path.join(__dirname, '..', 'templates');
  const templates = discoverTemplates(templatesDir);

  if (templates.length === 0) {
    console.error(chalk.red('Error: No templates found'));
    process.exit(1);
  }

  // Select template
  let selectedTemplateFolderName: string;
  
  if (options?.template) {
    // Validate provided template
    const template = templates.find(t => t.folderName === options.template);
    if (!template) {
      console.error(chalk.red(`Error: Template "${options.template}" not found`));
      console.log(chalk.dim('Available templates:'), templates.map(t => t.folderName).join(', '));
      process.exit(1);
    }
    selectedTemplateFolderName = options.template;
    console.log(chalk.dim(`Using template: ${template.name}`));
  } else {
    const templateChoice = await prompts({
      type: 'select',
      name: 'templateFolder',
      message: 'What type of app?',
      choices: templates.map(t => ({
        title: `${t.name} - ${t.description}`,
        value: t.folderName
      }))
    });

    if (!templateChoice.templateFolder) {
      console.log(chalk.dim('Cancelled'));
      process.exit(0);
    }
    
    selectedTemplateFolderName = templateChoice.templateFolder;
  }

  const template = templates.find(t => t.folderName === selectedTemplateFolderName)!;

  // Start with project name
  const config: Record<string, any> = {
    name: projectName
  };

  // Add provided config values
  if (options?.config) {
    Object.assign(config, options.config);
  }

  // Convert template prompts to prompts format and run them
  if (template.prompts.length > 0) {
    // Filter out prompts that already have values from CLI args
    const remainingPrompts = template.prompts.filter(p => !(p.name in config));
    
    if (remainingPrompts.length > 0) {
      const promptsConfig = remainingPrompts.map(p => ({
        type: p.type === 'bool' ? ('confirm' as const) : (p.type as 'text' | 'number'),
        name: p.name,
        message: p.message,
        initial: p.initial
      }));

      console.log();
      const answers = await prompts(promptsConfig);

      if (Object.keys(answers).length !== remainingPrompts.length) {
        console.log(chalk.dim('Cancelled'));
        process.exit(0);
      }

      Object.assign(config, answers);
    }

    // Fill in any missing values with defaults
    for (const prompt of template.prompts) {
      if (!(prompt.name in config) && prompt.initial !== undefined) {
        config[prompt.name] = prompt.initial;
      }
    }
  }

  // Create project directory
  fs.mkdirSync(projectName, { recursive: true });

  // Copy template files
  const templateDir = path.join(templatesDir, template.folderName);
  copyTemplateFiles(templateDir, projectName, config);

  console.log();
  console.log(chalk.green(`✨ Created ${projectName}`));
  console.log();
  console.log('Next steps:');
  console.log(chalk.dim(`  cd ${projectName}`));
  console.log(chalk.dim('  ./run.sh dev         # Local development'));
  console.log(chalk.dim('  ./run.sh deploy      # Deploy to production'));
}