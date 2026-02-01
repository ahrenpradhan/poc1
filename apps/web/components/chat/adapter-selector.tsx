"use client";

import { useEffect, useState } from "react";
import { ConfigSelector, ConfigOption } from "./config-selector";

export type AdapterType = string;

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
  const [options, setOptions] = useState<ConfigOption<AdapterType>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdapters = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/config/adapters`,
        );
        if (response.ok) {
          const data = await response.json();
          setOptions(data.adapters);
        }
      } catch (error) {
        console.error("Failed to fetch adapters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdapters();
  }, []);

  if (loading || options.length === 0) {
    return <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />;
  }

  return (
    <ConfigSelector
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
    />
  );
}
