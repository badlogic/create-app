import type { Request, Response, Router } from "express";
import type { Api } from "../shared/api.js";
import { apiRoutes } from "../shared/api.js";

// Auto-generate Express routes from API definition
export function createApiRouter(router: Router, handlers: Api): Router {
  for (const [methodName, route] of Object.entries(apiRoutes)) {
    // biome-ignore lint/suspicious/noExplicitAny: fine
    const handler = (handlers as any)[methodName];
    const method = route.method.toLowerCase() as "get" | "post" | "patch" | "delete";

    router[method](route.path, async (req: Request, res: Response) => {
      try {
        // Collect arguments: path params first, then body (if POST/PATCH)
        // biome-ignore lint/suspicious/noExplicitAny: fine
        const args: any[] = [];

        // Extract path params (e.g., :id)
        const pathParams = route.path.match(/:\w+/g) || [];
        for (const param of pathParams) {
          const paramName = param.slice(1); // Remove :
          args.push(req.params[paramName]);
        }

        // Add body if present (POST/PATCH)
        if (route.method === "POST" || route.method === "PATCH") {
          args.push(req.body);
        }

        // Call handler
        const result = await handler(...args);

        // Send response
        if (result === undefined) {
          // Void return (DELETE, etc)
          res.status(204).send();
        } else if (result === null) {
          // Null response (e.g., not found in GET requests)
          res.status(200).json(null);
        } else {
          res.json(result);
        }
        // biome-ignore lint/suspicious/noExplicitAny: fine
      } catch (error: any) {
        res.status(500).send(error.message || "Internal server error");
      }
    });
  }

  return router;
}
