import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/services/healthService";
import { queryKeys } from "@/queries/queryKeys";

/**
 * There is no dedicated "Playwright agent" heartbeat endpoint — this approximates
 * agent/automation availability with plain backend reachability via GET /health.
 */
export function useAgentHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => healthService.check(),
    refetchInterval: 10_000,
    retry: false,
  });
}
