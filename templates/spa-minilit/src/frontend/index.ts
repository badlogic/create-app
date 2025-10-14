import { Button } from "@mariozechner/mini-lit/dist/Button.js";
import { Card, CardHeader } from "@mariozechner/mini-lit/dist/Card.js";
import { html, render } from "lit";
import "@mariozechner/mini-lit/dist/ThemeToggle.js";
import "@mariozechner/mini-lit/dist/CodeBlock.js";
import "./styles.css";

async function callAPI(endpoint: string): Promise<unknown> {
   try {
      const response = await fetch(`/api${endpoint}`);

      if (!response.ok) {
         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
   } catch (error) {
      console.error("API call failed:", error);
      throw error;
   }
}

let responseData: unknown = null;
let errorMessage: string = "";

function updateUI() {
   render(App(), document.body);
}

async function handleHealthCheck() {
   try {
      responseData = await callAPI("/health");
      errorMessage = "";
      updateUI();
   } catch (error) {
      errorMessage = (error as Error).message;
      responseData = null;
      updateUI();
   }
}

async function handleHello() {
   try {
      responseData = await callAPI("/hello");
      errorMessage = "";
      updateUI();
   } catch (error) {
      errorMessage = (error as Error).message;
      responseData = null;
      updateUI();
   }
}

const App = () => html`
  <div class="min-h-screen bg-background text-foreground p-8">
    <theme-toggle class="fixed top-4 right-4"></theme-toggle>

    <div class="max-w-md mx-auto space-y-4">
      ${Card(html`
        ${CardHeader(html`<h1 class="text-2xl font-bold text-center">{{name}}</h1>`)}

        <div class="px-3 space-y-3">
            ${Button({
               variant: "default",
               onClick: handleHealthCheck,
               children: html`Check API Health`,
               className: "w-full",
            })}

            ${Button({
               variant: "default",
               onClick: handleHello,
               children: html`Say Hello`,
               className: "w-full",
            })}

          ${responseData ? html`<code-block .code=${JSON.stringify(responseData)} language="json"></code-block>` : ""}
          ${errorMessage ? html`<code-block .code=${JSON.stringify(errorMessage)} language="json"></code-block>` : ""}
        </div>
      `)}
    </div>
  </div>
`;

// Initial render
updateUI();
