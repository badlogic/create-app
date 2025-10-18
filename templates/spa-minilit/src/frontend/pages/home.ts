import { Button } from "@mariozechner/mini-lit/dist/Button.js";
import { Card, CardHeader } from "@mariozechner/mini-lit/dist/Card.js";
import "@mariozechner/mini-lit/dist/CodeBlock.js";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createApiClient } from "../api-client.js";
import type { HealthResponse, HelloResponse } from "../../shared/types.js";

const api = createApiClient();

@customElement("page-home")
export class PageHome extends LitElement {
  @state() responseData: unknown = null;
  @state() errorMessage: string = "";

  createRenderRoot() {
    return this;
  }

  async handleHealthCheck() {
    try {
      const data: HealthResponse = await api.health();
      this.responseData = data;
      this.errorMessage = "";
    } catch (error) {
      this.errorMessage = (error as Error).message;
      this.responseData = null;
    }
  }

  async handleHello() {
    try {
      const data: HelloResponse = await api.hello();
      this.responseData = data;
      this.errorMessage = "";
    } catch (error) {
      this.errorMessage = (error as Error).message;
      this.responseData = null;
    }
  }

  render() {
    return html`
      <div class="p-8">
        <div class="max-w-md mx-auto space-y-4">
          ${Card(html`
            ${CardHeader(html`<h1 class="text-2xl font-bold text-center">{{name}}</h1>`)}

            <div class="px-3 space-y-3">
              ${Button({
                variant: "default",
                onClick: () => this.handleHealthCheck(),
                children: html`Check API Health`,
                className: "w-full",
              })}

              ${Button({
                variant: "default",
                onClick: () => this.handleHello(),
                children: html`Say Hello`,
                className: "w-full",
              })}

              ${this.responseData ? html`<code-block .code=${JSON.stringify(this.responseData, null, 2)} language="json"></code-block>` : ""}
              ${this.errorMessage ? html`<div class="text-red-500">${this.errorMessage}</div>` : ""}
            </div>
          `)}
        </div>
      </div>
    `;
  }
}
