import { useEffect, useRef } from "react";
import mermaid from "mermaid";

let mermaidInitialized = false;

function initMermaid() {
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "strict",
    });
    mermaidInitialized = true;
  }
}

export function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    initMermaid();

    const id = `mermaid-${Date.now()}`;

    mermaid
      .render(id, code)
      .then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      })
      .catch((err) => {
        console.error("Mermaid render failed:", err);
        if (ref.current) {
          ref.current.innerText = code;
        }
      });
  }, [code]);

  return <div ref={ref} />;
}
