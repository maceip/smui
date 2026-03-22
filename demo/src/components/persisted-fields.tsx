"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePersistedInput } from "@/hooks/use-persisted-state";

/**
 * Input that persists its value to localStorage.
 * When the user navigates away and returns, the text is restored.
 */
export function PersistedInput({
  persistKey,
  defaultValue = "",
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  persistKey: string;
  defaultValue?: string;
}) {
  const { value, onChange } = usePersistedInput(persistKey, defaultValue);
  return <Input {...props} value={value} onChange={onChange} />;
}

/**
 * Textarea that persists its value to localStorage.
 * When the user navigates away and returns, the text is restored.
 */
export function PersistedTextarea({
  persistKey,
  defaultValue = "",
  ...props
}: Omit<React.ComponentProps<typeof Textarea>, "value" | "onChange"> & {
  persistKey: string;
  defaultValue?: string;
}) {
  const { value, onChange } = usePersistedInput(persistKey, defaultValue);
  return <Textarea {...props} value={value} onChange={onChange} />;
}
