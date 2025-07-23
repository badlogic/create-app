export interface TemplateConfig {
   name: string; // Display name for CLI
   description: string;
   prompts: Prompt[];
}

export interface Prompt {
   name: string;
   type: "text" | "number" | "bool";
   message: string;
   initial?: string | number | boolean;
}
