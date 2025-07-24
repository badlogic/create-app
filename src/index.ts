import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { isText } from "istextorbinary";
import * as yaml from "js-yaml";
import prompts from "prompts";
import type { TemplateConfig } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function replaceTemplateVars(content: string, config: Record<string, string | number | boolean>): string {
   let result = content;

   for (const [key, value] of Object.entries(config)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, String(value));
   }

   return result;
}

function discoverTemplates(templatesDir: string): Array<TemplateConfig & { folderName: string }> {
   const templates: Array<TemplateConfig & { folderName: string }> = [];

   const templateDirs = fs
      .readdirSync(templatesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

   for (const templateDir of templateDirs) {
      const templateJsonPath = path.join(templatesDir, templateDir, "template.json");

      if (fs.existsSync(templateJsonPath)) {
         const templateJson = JSON.parse(fs.readFileSync(templateJsonPath, "utf8"));
         templates.push({
            folderName: templateDir,
            ...templateJson,
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

function copyTemplateFiles(
   templateDir: string,
   parentTemplateDirs: string[],
   destPath: string,
   config: Record<string, string | number | boolean>,
): void {
   // First, copy all parent templates in order
   for (const parentDir of parentTemplateDirs) {
      copyTemplateFilesRecursive(parentDir, destPath, config);
   }

   // Then copy current template, overwriting any existing files
   copyTemplateFilesRecursive(templateDir, destPath, config);

   // Finally, handle deletions (files with _ prefix)
   handleDeletions(templateDir, destPath);
}

function copyTemplateFilesRecursive(
   templateDir: string,
   destPath: string,
   config: Record<string, string | number | boolean>,
): void {
   function copyRecursive(srcDir: string, destDir: string, relativePath = "") {
      const items = fs.readdirSync(srcDir, { withFileTypes: true });

      for (const item of items) {
         const srcPath = path.join(srcDir, item.name);
         const destFilePath = path.join(destDir, item.name);
         const itemRelativePath = path.join(relativePath, item.name);

         // Skip template.json
         if (item.name === "template.json") {
            continue;
         }

         // Skip deletion markers (files/dirs starting with -)
         if (item.name.startsWith("-")) {
            continue;
         }

         // Handle merge markers (files starting with +)
         if (item.name.startsWith("+")) {
            const targetName = item.name.slice(1); // Remove + prefix
            const targetPath = path.join(destDir, targetName);

            if (fs.existsSync(targetPath)) {
               mergeFile(srcPath, targetPath, config);
               continue;
            } else {
               // Target doesn't exist, treat as regular copy but without + prefix
               const newDestPath = path.join(destDir, targetName);
               const destFileDir = path.dirname(newDestPath);
               if (!fs.existsSync(destFileDir)) {
                  fs.mkdirSync(destFileDir, { recursive: true });
               }

               const srcStats = fs.statSync(srcPath);
               if (isTextFile(srcPath)) {
                  let content = fs.readFileSync(srcPath, "utf8");
                  content = replaceTemplateVars(content, config);
                  fs.writeFileSync(newDestPath, content);
               } else {
                  fs.copyFileSync(srcPath, newDestPath);
               }
               fs.chmodSync(newDestPath, srcStats.mode);
               continue;
            }
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
               let content = fs.readFileSync(srcPath, "utf8");
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

function mergeFile(srcPath: string, targetPath: string, config: Record<string, string | number | boolean>): void {
   const ext = path.extname(srcPath).toLowerCase();

   try {
      if (ext === ".json") {
         const srcContent = fs.readFileSync(srcPath, "utf8");
         const processedSrc = replaceTemplateVars(srcContent, config);
         const srcObj = JSON.parse(processedSrc);

         const targetObj = JSON.parse(fs.readFileSync(targetPath, "utf8"));

         const merged = deepMerge(targetObj, srcObj);
         fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2));
      } else if (ext === ".yml" || ext === ".yaml") {
         const srcContent = fs.readFileSync(srcPath, "utf8");
         const processedSrc = replaceTemplateVars(srcContent, config);
         const srcObj = yaml.load(processedSrc) as any;

         const targetContent = fs.readFileSync(targetPath, "utf8");
         const targetObj = yaml.load(targetContent) as any;

         const merged = deepMerge(targetObj, srcObj);
         fs.writeFileSync(
            targetPath,
            yaml.dump(merged, {
               indent: 2,
               lineWidth: -1,
               noRefs: true,
            }),
         );
      } else {
         console.warn(`Don't know how to merge file type: ${srcPath}`);
      }
   } catch (error) {
      console.error(`Error merging ${srcPath} into ${targetPath}:`, error);
   }
}

function deepMerge(target: any, source: any): any {
   if (Array.isArray(target) && Array.isArray(source)) {
      return [...target, ...source];
   }

   if (target && typeof target === "object" && source && typeof source === "object") {
      const result = { ...target };

      for (const key in source) {
         if (Object.hasOwn(source, key)) {
            if (key in result) {
               result[key] = deepMerge(result[key], source[key]);
            } else {
               result[key] = source[key];
            }
         }
      }

      return result;
   }

   return source;
}

function handleDeletions(templateDir: string, destPath: string): void {
   function processDirectory(srcDir: string, destDir: string) {
      if (!fs.existsSync(srcDir)) return;

      const items = fs.readdirSync(srcDir, { withFileTypes: true });

      for (const item of items) {
         if (item.name.startsWith("-") && item.name !== "-") {
            // This is a deletion marker
            const targetName = item.name.slice(1); // Remove - prefix
            const targetPath = path.join(destDir, targetName);

            if (fs.existsSync(targetPath)) {
               const stats = fs.statSync(targetPath);
               if (stats.isDirectory()) {
                  fs.rmSync(targetPath, { recursive: true, force: true });
               } else {
                  fs.unlinkSync(targetPath);
               }
            }
         } else if (item.isDirectory() && !item.name.startsWith("-")) {
            // Recursively process subdirectories
            processDirectory(path.join(srcDir, item.name), path.join(destDir, item.name));
         }
      }
   }

   processDirectory(templateDir, destPath);
}

function resolveTemplateInheritance(
   templates: Array<TemplateConfig & { folderName: string }>,
   templateName: string,
   visited = new Set<string>(),
): string[] {
   if (visited.has(templateName)) {
      throw new Error(`Circular dependency detected in template inheritance: ${templateName}`);
   }

   const template = templates.find((t) => t.folderName === templateName);
   if (!template) {
      throw new Error(`Template not found: ${templateName}`);
   }

   visited.add(templateName);

   const parentPaths: string[] = [];

   if (template.inherits) {
      for (const parentName of template.inherits) {
         // First get the parent's inheritance chain
         const parentChain = resolveTemplateInheritance(templates, parentName, new Set(visited));
         parentPaths.push(...parentChain);
         // Then add the parent itself
         parentPaths.push(parentName);
      }
   }

   visited.delete(templateName);
   return parentPaths;
}

export async function createApp(
   projectName: string,
   options?: { template?: string; config?: Record<string, string | number | boolean> },
): Promise<void> {
   console.log(chalk.blue(`Creating app: ${projectName}`));
   console.log();

   // Check if directory already exists
   if (fs.existsSync(projectName)) {
      console.error(chalk.red(`Error: Directory ${projectName} already exists`));
      process.exit(1);
   }

   // Discover templates
   const templatesDir = path.join(__dirname, "..", "templates");
   const templates = discoverTemplates(templatesDir);

   if (templates.length === 0) {
      console.error(chalk.red("Error: No templates found"));
      process.exit(1);
   }

   // Select template
   let selectedTemplateFolderName: string;

   if (options?.template) {
      // Validate provided template
      const template = templates.find((t) => t.folderName === options.template);
      if (!template) {
         console.error(chalk.red(`Error: Template "${options.template}" not found`));
         console.log(chalk.dim("Available templates:"), templates.map((t) => t.folderName).join(", "));
         process.exit(1);
      }
      selectedTemplateFolderName = options.template;
      console.log(chalk.dim(`Using template: ${template.name}`));
   } else {
      const templateChoice = await prompts({
         type: "select",
         name: "templateFolder",
         message: "What type of app?",
         choices: templates.map((t) => ({
            title: `${t.name} - ${t.description}`,
            value: t.folderName,
         })),
      });

      if (!templateChoice.templateFolder) {
         console.log(chalk.dim("Cancelled"));
         process.exit(0);
      }

      selectedTemplateFolderName = templateChoice.templateFolder;
   }

   const template = templates.find((t) => t.folderName === selectedTemplateFolderName);
   if (!template) {
      console.error(chalk.red(`Error: Template "${selectedTemplateFolderName}" not found`));
      process.exit(1);
   }

   // Start with project name
   const config: Record<string, string | number | boolean> = {
      name: projectName,
   };

   // Add provided config values
   if (options?.config) {
      Object.assign(config, options.config);
   }

   // Convert template prompts to prompts format and run them
   if (template.prompts.length > 0) {
      // Filter out prompts that already have values from CLI args
      const remainingPrompts = template.prompts.filter((p) => !(p.name in config));

      if (remainingPrompts.length > 0) {
         const promptsConfig = remainingPrompts.map((p) => ({
            type: p.type === "bool" ? ("confirm" as const) : (p.type as "text" | "number"),
            name: p.name,
            message: p.message,
            initial: p.initial,
         }));

         console.log();
         const answers = await prompts(promptsConfig);

         if (Object.keys(answers).length !== remainingPrompts.length) {
            console.log(chalk.dim("Cancelled"));
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

   // Resolve template inheritance chain
   const parentTemplateNames = resolveTemplateInheritance(templates, template.folderName);
   const parentTemplateDirs = parentTemplateNames.map((name) => path.join(templatesDir, name));

   // Copy template files with inheritance
   const templateDir = path.join(templatesDir, template.folderName);
   copyTemplateFiles(templateDir, parentTemplateDirs, projectName, config);

   console.log();
   console.log(chalk.green(`✨ Created ${projectName}`));
   console.log();
   console.log("Next steps:");
   console.log(chalk.dim(`  cd ${projectName}`));
   console.log(chalk.dim("  ./run.sh dev         # Local development"));
   console.log(chalk.dim("  ./run.sh deploy      # Deploy to production"));
}
