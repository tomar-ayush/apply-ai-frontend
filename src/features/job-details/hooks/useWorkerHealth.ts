import { useCallback, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";

const WORKER_URL_STORAGE_KEY = "applyai_worker_url";

interface WorkerHealthResponse {
  status: string;
  timestamp: string;
}

// Module-level shared store so every component stays in sync when the URL changes
// (previously each component held its own useState, so saving in one place didn't
// update the others until a full remount/refresh).
let workerUrl = localStorage.getItem(WORKER_URL_STORAGE_KEY) ?? "";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** The local automation agent's tunnel URL (e.g. a Cloudflare tunnel) — stored client-side only. */
export function useWorkerUrl() {
  const url = useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => workerUrl
  );

  const setUrl = useCallback((next: string) => {
    const trimmed = next.trim().replace(/\/+$/, "");
    workerUrl = trimmed;
    if (trimmed) localStorage.setItem(WORKER_URL_STORAGE_KEY, trimmed);
    else localStorage.removeItem(WORKER_URL_STORAGE_KEY);
    emit();
  }, []);

  return [url, setUrl] as const;
}

/** Polls the agent's own /health endpoint directly (not via our backend — it runs on the user's machine). */
export function useWorkerHealth(workerUrl: string, enabled = true) {
  return useQuery({
    queryKey: ["worker-health", workerUrl],
    queryFn: async (): Promise<WorkerHealthResponse> => {
      const res = await fetch(`${workerUrl}/health`);
      if (!res.ok) throw new Error("Worker agent is unhealthy");
      return res.json();
    },
    enabled: !!workerUrl && enabled,
    refetchInterval: 10_000,
    retry: false,
  });
}
