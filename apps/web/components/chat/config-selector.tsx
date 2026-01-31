"use client";

import { ChevronDown } from "lucide-react";

export interface ConfigOption<T extends string> {
  value: T;
  label: string;
}

interface ConfigSelectorProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ConfigOption<T>[];
  disabled?: boolean;
  className?: string;
}

export function ConfigSelector<T extends string>({
  value,
  onChange,
  options,
  disabled,
  className,
}: ConfigSelectorProps<T>) {
  return (
    <div className={`relative inline-block ${className || ""}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className="appearance-none bg-background border border-border rounded-lg px-3 py-1.5 pr-8 text-sm cursor-pointer hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
    </div>
  );
}
