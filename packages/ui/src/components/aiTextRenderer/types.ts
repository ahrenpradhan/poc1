export type MarkdownBlock =
  | { type: "text"; content: string }
  | { type: "code"; lang: string; content: string };

export type NormalizedBlock =
  | { type: "text"; content: string; lang: string }
  | { type: "code"; content: string; lang: string }
  | { type: "mermaid"; content: string }
  | { type: "vega-lite"; content: string };
