export function hello(name: string): string {
   return `Hello, ${name}!`;
}

export class Example {
   private name: string;

   constructor(name: string) {
      this.name = name;
   }

   greet(): string {
      return hello(this.name);
   }
}