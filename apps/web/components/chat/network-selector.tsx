"use client";

import { ConfigSelector, ConfigOption } from "./config-selector";

export type NetworkType = "api" | "sse";

const networkOptions: ConfigOption<NetworkType>[] = [
  {
    value: "api",
    label: "2 API method",
    description:
      "Use the process where frontend sends a request and receives a response, followed by a second request to fetch the result.",
  },
  { value: "sse", label: "SSE", description: "Use the Server-Sent Events" },
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
