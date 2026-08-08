// frontend/src/lib/extension.ts - Extension Connection & Fallback Helper

declare const chrome: any;

const EXTENSION_ID_KEY = "APPLYAI_EXTENSION_ID";

export function getStoredExtensionId(): string {
  return localStorage.getItem(EXTENSION_ID_KEY) ?? "";
}

export function setStoredExtensionId(id: string): void {
  const trimmed = id.trim();
  if (trimmed) {
    localStorage.setItem(EXTENSION_ID_KEY, trimmed);
  } else {
    localStorage.removeItem(EXTENSION_ID_KEY);
  }
}

export interface ExtensionPingResult {
  connected: boolean;
  version?: string;
  source?: "postMessage" | "directSendMessage";
  error?: string;
}

function isValidExtensionId(id: string): boolean {
  return typeof id === "string" && /^[a-p]{32}$/i.test(id.trim());
}

export async function pingExtension(customExtensionId?: string): Promise<ExtensionPingResult> {
  const extId = (customExtensionId || getStoredExtensionId()).trim();
  console.log("[DEBUG] Testing extension connection...", { extId });

  // Method 1: Try direct chrome.runtime.sendMessage ONLY if valid 32-character extension ID is provided
  if (isValidExtensionId(extId) && typeof window !== "undefined" && (window as any).chrome && typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    try {
      const response = await new Promise<any>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Direct chrome.runtime.sendMessage timed out")), 1500);
        chrome.runtime.sendMessage(extId, { type: "PING" }, (res: any) => {
          clearTimeout(timer);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(res);
          }
        });
      });

      if (response && response.installed) {
        console.log("[DEBUG] Extension ping successful via direct chrome.runtime.sendMessage:", response);
        return { connected: true, version: response.version, source: "directSendMessage" };
      }
    } catch (err: any) {
      console.warn("[DEBUG] Direct extension ID ping failed:", err?.message || err);
    }
  }

  // Method 2: Fallback to window.postMessage bridge
  return new Promise<ExtensionPingResult>((resolve) => {
    const timer = setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      console.warn("[DEBUG] Window postMessage ping timed out - extension bridge not detected.");
      resolve({ connected: false, error: "Extension bridge not detected" });
    }, 2000);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "APPLYAI_EXTENSION_INSTALLED" || event.data?.type === "APPLYAI_TASK_RESPONSE") {
        clearTimeout(timer);
        window.removeEventListener("message", handleMessage);
        console.log("[DEBUG] Extension ping successful via window.postMessage bridge:", event.data);
        resolve({ connected: true, version: event.data.version || "1.0.0", source: "postMessage" });
      }
    };

    window.addEventListener("message", handleMessage);
    window.postMessage({ type: "APPLYAI_PING" }, "*");
  });
}

export function dispatchTaskToExtension(payload: Record<string, unknown>): boolean {
  console.log("[DEBUG] Dispatching task to Chrome Extension with payload:", payload);

  // 1. Send via DOM postMessage bridge
  window.postMessage({ type: "APPLYAI_LINKEDIN_TASK", payload }, "*");

  // 2. Direct fallback via Extension ID ONLY if valid 32-character extension ID is provided
  const extId = getStoredExtensionId().trim();
  if (isValidExtensionId(extId) && typeof window !== "undefined" && (window as any).chrome && typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    try {
      chrome.runtime.sendMessage(extId, { type: "LINKEDIN_TASK", payload }, (res: any) => {
        console.log("[DEBUG] Direct extension ID task response:", res);
      });
    } catch (err) {
      console.warn("[DEBUG] Failed direct extension task send:", err);
    }
  }

  return true;
}
