"use client";

import { ConfigSelector, ConfigOption } from "./config-selector";

export type AdapterType = "mock" | "ollama";

const adapterOptions: ConfigOption<AdapterType>[] = [
  { value: "mock", label: "Mock", description: "Use the mock adapter" },
  { value: "ollama", label: "Ollama", description: "Use the Ollama adapter" },
];

interface AdapterSelectorProps {
  value: AdapterType;
  onChange: (value: AdapterType) => void;
  disabled?: boolean;
}

export function AdapterSelector({
  value,
  onChange,
  disabled,
}: AdapterSelectorProps) {
  return (
    <ConfigSelector
      value={value}
      onChange={onChange}
      options={adapterOptions}
      disabled={disabled}
    />
  );
}
