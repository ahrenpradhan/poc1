"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/primitives/select";

export interface ConfigOption<T extends string> {
  value: T;
  label: string;
  description?: string;
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
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={`w-auto h-8 text-sm ${className || ""}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
