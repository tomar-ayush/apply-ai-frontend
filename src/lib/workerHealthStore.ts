import { useSyncExternalStore } from "react";

export interface WorkerHealthSnapshot {
    workerUrl: string;
    isHealthy: boolean;
    dataUpdatedAt: number | undefined;
}

// Module-level store so the sidebar ConnectionIndicator (rendered outside the jobs
// page) can mirror the worker health that WorkerStatusCard polls, without doing any
// fetching of its own. WorkerStatusCard is the only writer; the indicator only reads.
let snapshot: WorkerHealthSnapshot = {
    workerUrl: "",
    isHealthy: false,
    dataUpdatedAt: undefined,
};

const listeners = new Set<() => void>();

export function publishWorkerHealth(next: WorkerHealthSnapshot): void {
    snapshot = next;
    listeners.forEach((listener) => listener());
}

export function useWorkerHealthSnapshot(): WorkerHealthSnapshot {
    return useSyncExternalStore(
        (onChange) => {
            listeners.add(onChange);
            return () => listeners.delete(onChange);
        },
        () => snapshot
    );
}
