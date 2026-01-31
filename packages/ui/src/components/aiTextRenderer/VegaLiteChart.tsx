"use client";

import { useEffect, useRef, useState } from "react";

export function VegaLiteChart({ spec }: { spec: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    let parsedSpec;
    try {
      parsedSpec = JSON.parse(spec);
    } catch (e) {
      setError("Invalid JSON specification");
      setLoading(false);
      return;
    }

    // Dynamically import vega-embed to avoid SSR issues
    import("vega-embed")
      .then(({ default: embed }) => {
        if (!containerRef.current) return;

        embed(containerRef.current, parsedSpec, {
          actions: {
            export: true,
            source: false,
            compiled: false,
            editor: false,
          },
          theme: "dark",
        })
          .then(() => {
            setError(null);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Vega-Lite render failed:", err);
            setError(err.message || "Failed to render chart");
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error("Failed to load vega-embed:", err);
        setError("Failed to load chart library");
        setLoading(false);
      });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [spec]);

  if (error) {
    return (
      <div className="my-2 rounded-md bg-red-900/20 border border-red-500/50 p-4 text-sm text-red-400">
        <p className="font-medium">Vega-Lite Error</p>
        <p>{error}</p>
        <pre className="mt-2 overflow-x-auto text-xs opacity-70">{spec}</pre>
      </div>
    );
  }

  return (
    <div className="my-2 rounded-md bg-muted p-4 overflow-x-auto">
      {loading && (
        <div className="text-muted-foreground text-sm">Loading chart...</div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
