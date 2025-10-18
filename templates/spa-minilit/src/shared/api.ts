import type { HealthResponse, HelloResponse } from "./types.js";

// API interface - shared contract between client and server
export interface Api {
  health(): Promise<HealthResponse>;
  hello(): Promise<HelloResponse>;
}

// Route definitions - used to auto-generate client and server
export interface RouteDefinition {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
}

export const apiRoutes: Record<keyof Api, RouteDefinition> = {
  health: { method: "GET", path: "/health" },
  hello: { method: "GET", path: "/hello" },
};

// Helper types
export type ApiMethod = keyof Api;
export type ApiRequest<M extends ApiMethod> = Parameters<Api[M]>;
export type ApiResponse<M extends ApiMethod> = Awaited<ReturnType<Api[M]>>;
