export interface TemplateConfig {
   name: string; // Display name for CLI
   description: string;
   inherits?: string[]; // Parent template names
   prompts: Prompt[];
}

export interface Prompt {
   name: string;
   type: "text" | "number" | "bool";
   message: string;
   initial?: string | number | boolean;
}
