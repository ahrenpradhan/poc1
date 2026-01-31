"use client";

import { ChevronDown } from "lucide-react";

export type AdapterType = "mock" | "ollama";

interface AdapterSelectorProps {
  value: AdapterType;
  onChange: (value: AdapterType) => void;
  disabled?: boolean;
}

const adapters: { value: AdapterType; label: string }[] = [
  { value: "mock", label: "Mock" },
  { value: "ollama", label: "Ollama" },
];

export function AdapterSelector({
  value,
  onChange,
  disabled,
}: AdapterSelectorProps) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AdapterType)}
        disabled={disabled}
        className="appearance-none bg-background border border-border rounded-lg px-3 py-1.5 pr-8 text-sm cursor-pointer hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {adapters.map((adapter) => (
          <option key={adapter.value} value={adapter.value}>
            {adapter.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
    </div>
  );
}
