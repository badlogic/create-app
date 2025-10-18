import type { Api } from "../shared/api.js";
import { apiRoutes } from "../shared/api.js";

// Auto-generate API client from route definitions
export function createApiClient(baseUrl: string = "/api"): Api {
  // biome-ignore lint/suspicious/noExplicitAny: fine
  const client = {} as any;

  for (const [methodName, route] of Object.entries(apiRoutes)) {
    // biome-ignore lint/suspicious/noExplicitAny: fine
    client[methodName] = async (...args: any[]) => {
      // Build path by replacing :param with actual values
      let path = route.path;
      let argIndex = 0;

      // Extract path params (e.g., :id)
      const pathParams = route.path.match(/:\w+/g) || [];
      for (const param of pathParams) {
        param.slice(1); // Remove :
        path = path.replace(param, encodeURIComponent(args[argIndex++]));
      }

      // Remaining args are body (for POST/PATCH)
      const body = argIndex < args.length ? args[argIndex] : undefined;

      // Build headers
      const headers: Record<string, string> = {};
      if (body) {
        headers["Content-Type"] = "application/json";
      }

      // Make request
      const response = await fetch(`${baseUrl}${path}`, {
        method: route.method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${error}`);
      }

      // Handle void responses (204)
      if (response.status === 204 || response.headers.get("content-length") === "0") {
        return undefined;
      }

      return response.json();
    };
  }

  return client as Api;
}
