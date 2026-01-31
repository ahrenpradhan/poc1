"use client";

import { ConfigSelector, ConfigOption } from "./config-selector";

export type NetworkType = "api" | "sse";

const networkOptions: ConfigOption<NetworkType>[] = [
  { value: "api", label: "API" },
  { value: "sse", label: "SSE" },
];

interface NetworkSelectorProps {
  value: NetworkType;
  onChange: (value: NetworkType) => void;
  disabled?: boolean;
}

export function NetworkSelector({
  value,
  onChange,
  disabled,
}: NetworkSelectorProps) {
  return (
    <ConfigSelector
      value={value}
      onChange={onChange}
      options={networkOptions}
      disabled={disabled}
    />
  );
}
