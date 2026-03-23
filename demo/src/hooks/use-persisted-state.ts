"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Like useState but persists the value to localStorage.
 * When the user navigates away and comes back, the value is restored.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const storageKey = `smui-persist:${key}`;

  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(storageKey);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }, [storageKey, value]);

  return [value, setValue];
}

/**
 * Hook for persisting text input/textarea values across page navigations.
 * Returns props to spread onto an input or textarea element.
 */
export function usePersistedInput(key: string, defaultValue = "") {
  const [value, setValue] = usePersistedState(key, defaultValue);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    [setValue]
  );

  return { value, onChange };
}
