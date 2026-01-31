import { Fragment } from "react";
import { splitMarkdownBlocks, normalizeBlocks } from "./utils";
import { CodeBlock } from "./CodeBlock";
import { MermaidDiagram } from "./MermaidDiagram";
import { VegaLiteChart } from "./VegaLiteChart";

export function AiTextRenderer({ content }: { content: string }) {
  // Check for code fences (including escaped backticks)
  const hasCodeFence = content.includes("```") || content.includes("\\`\\`\\`");
  if (!hasCodeFence) {
    return <>{content}</>;
  }

  const blocks = splitMarkdownBlocks(content);
  const normalizedBlocks = normalizeBlocks(blocks);

  return (
    <>
      {normalizedBlocks.map((block, index) => {
        const key = `block-${index}`;

        switch (block.type) {
          case "mermaid":
            return (
              <Fragment key={key}>
                <MermaidDiagram code={block.content} />
              </Fragment>
            );
          case "vega-lite":
            return (
              <Fragment key={key}>
                <VegaLiteChart spec={block.content} />
              </Fragment>
            );
          case "code":
            return (
              <Fragment key={key}>
                <CodeBlock code={block.content} language={block.lang} />
              </Fragment>
            );
          default:
            return (
              <Fragment key={key}>
                {block.content}
                <br />
              </Fragment>
            );
        }
      })}
    </>
  );
}

export { CodeBlock } from "./CodeBlock";
export { MermaidDiagram } from "./MermaidDiagram";
export { VegaLiteChart } from "./VegaLiteChart";
export { splitMarkdownBlocks, normalizeBlocks } from "./utils";
export type { MarkdownBlock, NormalizedBlock } from "./types";
