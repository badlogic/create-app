// Types shared between frontend and backend (API contract)

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface HelloResponse {
  message: string;
}
