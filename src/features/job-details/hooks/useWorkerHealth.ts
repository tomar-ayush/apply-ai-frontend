import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const WORKER_URL_STORAGE_KEY = "applyai_worker_url";

interface WorkerHealthResponse {
  status: string;
  timestamp: string;
}

/** The local automation agent's tunnel URL (e.g. a Cloudflare tunnel) — stored client-side only. */
export function useWorkerUrl() {
  const [url, setUrlState] = useState(() => localStorage.getItem(WORKER_URL_STORAGE_KEY) ?? "");

  const setUrl = useCallback((next: string) => {
    const trimmed = next.trim().replace(/\/+$/, "");
    setUrlState(trimmed);
    if (trimmed) localStorage.setItem(WORKER_URL_STORAGE_KEY, trimmed);
    else localStorage.removeItem(WORKER_URL_STORAGE_KEY);
  }, []);

  return [url, setUrl] as const;
}

/** Polls the agent's own /health endpoint directly (not via our backend — it runs on the user's machine). */
export function useWorkerHealth(workerUrl: string) {
  return useQuery({
    queryKey: ["worker-health", workerUrl],
    queryFn: async (): Promise<WorkerHealthResponse> => {
      const res = await fetch(`${workerUrl}/health`);
      if (!res.ok) throw new Error("Worker agent is unhealthy");
      return res.json();
    },
    enabled: !!workerUrl,
    refetchInterval: 10_000,
    retry: false,
  });
}
