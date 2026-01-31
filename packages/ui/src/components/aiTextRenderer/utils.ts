import type { MarkdownBlock, NormalizedBlock } from "./types";

export function splitMarkdownBlocks(input: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const [fullMatch, lang = "plaintext", code] = match;

    if (match.index > lastIndex) {
      const text = input.slice(lastIndex, match.index).trim();
      if (text) {
        blocks.push({ type: "text", content: text });
      }
    }

    blocks.push({
      type: "code",
      lang: lang.toLowerCase(),
      content: code.trim(),
    });

    lastIndex = match.index + fullMatch.length;
  }

  const remaining = input.slice(lastIndex).trim();
  if (remaining) {
    blocks.push({ type: "text", content: remaining });
  }

  return blocks;
}

export function normalizeBlocks(blocks: MarkdownBlock[]): NormalizedBlock[] {
  return blocks.map((block) => {
    if (block.type === "code") {
      if (block.lang === "mermaid") {
        return { type: "mermaid" as const, content: block.content };
      }
      if (block.lang === "vega-lite") {
        return { type: "vega-lite" as const, content: block.content };
      }
      return {
        type: "code" as const,
        content: block.content,
        lang: block.lang,
      };
    }
    return { type: "text" as const, content: block.content, lang: "default" };
  });
}

const languageMap: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  terminal: "bash",
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  yml: "yaml",
  md: "markdown",
  plaintext: "bash",
  default: "bash",
};

export function normalizeLanguage(lang: string): string {
  const lower = lang.toLowerCase();
  return languageMap[lower] || lower;
}
