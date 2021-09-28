export interface RuntimeHealth {
    isHealthy: boolean;
    services: Record<string, "healthy" | "unhealthy">;
}
