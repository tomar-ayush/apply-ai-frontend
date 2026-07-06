import { useCallback, useState } from "react";

export function useLocalStorage(key: string, initialValue: boolean) {
  const [value, setValue] = useState<boolean>(() => {
    const stored = localStorage.getItem(key);
    return stored === null ? initialValue : stored === "true";
  });

  const setStoredValue = useCallback(
    (next: boolean) => {
      setValue(next);
      localStorage.setItem(key, String(next));
    },
    [key]
  );

  return [value, setStoredValue] as const;
}
