#!/usr/bin/env node

import * as path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { createApp, discoverTemplates } from "./index.js";

type ParsedArgs = {
   projectName?: string;
   template?: string;
   config?: Record<string, string | number | boolean>;
   help?: boolean;
};

function parseArgs(args: string[]): ParsedArgs {
   const result: ParsedArgs = {
      config: {},
   };

   for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === "--help" || arg === "-h") {
         result.help = true;
      } else if (arg === "--template" || arg === "-t") {
         result.template = args[++i];
      } else if (arg.startsWith("--")) {
         // Handle --key=value or --key value
         const [key, value] = arg.includes("=") ? arg.split("=", 2) : [arg, args[++i]];
         const configKey = key.replace(/^--/, "");

         // Try to parse as number, otherwise keep as string
         const parsedValue = !Number.isNaN(Number(value)) && value !== "" ? Number(value) : value;
         if (result.config) {
            result.config[configKey] = parsedValue;
         }
      } else if (!result.projectName) {
         result.projectName = arg;
      }
   }

   return result;
}

function showHelp() {
   const __dirname = path.dirname(fileURLToPath(import.meta.url));
   const templatesDir = path.join(__dirname, "..", "templates");
   const templates = discoverTemplates(templatesDir);

   console.log(chalk.blue("Create App - Project scaffolding for TypeScript applications and libraries"));
   console.log();
   console.log(chalk.bold("Usage:"));
   console.log("  npx @mariozechner/create-app <project-name> [options]");
   console.log();
   console.log(chalk.bold("Options:"));
   console.log("  -t, --template <name>     Template to use");
   console.log("  -h, --help                Show this help message");
   console.log("  --<option> <value>        Template-specific options (see below)");
   console.log();
   console.log(chalk.bold("Available Templates:"));
   console.log();

   for (const template of templates) {
      console.log(chalk.yellow(`  ${template.folderName}`) + ` - ${template.description}`);
      if (template.prompts && template.prompts.length > 0) {
         const optionNames = template.prompts.map((p) => `--${p.name}`).join(", ");
         console.log(chalk.dim(`    Options: ${optionNames}`));
      }
      console.log();
   }

   console.log(chalk.bold("Examples:"));
   console.log("  npx @mariozechner/create-app my-blog");
   console.log("  npx @mariozechner/create-app my-app --template spa-api --domain myapp.com");
   console.log("  npx @mariozechner/create-app my-lib --template web-library --packageName @myorg/mylib");
   console.log();
   console.log(chalk.dim("Note: All options can be provided via CLI or will be prompted interactively"));
}

async function main() {
   const args = process.argv.slice(2);
   const parsed = parseArgs(args);

   if (parsed.help) {
      showHelp();
      process.exit(0);
   }

   if (!parsed.projectName) {
      console.error(chalk.red("Error: Project name is required"));
      console.log(chalk.dim("Usage: npx @mariozechner/create-app <project-name> [options]"));
      console.log(chalk.dim("Use --help for more information"));
      process.exit(1);
   }

   // Validate project name
   if (!/^[a-zA-Z0-9-_]+$/.test(parsed.projectName)) {
      console.error(chalk.red("Error: Project name can only contain letters, numbers, hyphens, and underscores"));
      console.log(chalk.dim("Examples: my-app, myapp, my_app, webapp123"));
      process.exit(1);
   }

   try {
      await createApp(parsed.projectName, {
         template: parsed.template,
         config: parsed.config,
      });
   } catch (error) {
      console.error(chalk.red("Error creating app:"), error);
      process.exit(1);
   }
}

main();
