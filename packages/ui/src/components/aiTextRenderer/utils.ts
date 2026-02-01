import type { MarkdownBlock, NormalizedBlock } from "./types";

export function splitMarkdownBlocks(input: string): MarkdownBlock[] {
  // Normalize escaped backticks: \` -> `
  const normalizedInput = input.replace(/\\`/g, "`");

  const blocks: MarkdownBlock[] = [];
  let currentIndex = 0;

  while (currentIndex < normalizedInput.length) {
    // Find the next code fence start
    const fenceStart = normalizedInput.indexOf("```", currentIndex);

    if (fenceStart === -1) {
      // No more code fences, add remaining text
      const remaining = normalizedInput.slice(currentIndex).trim();
      if (remaining) {
        blocks.push({ type: "text", content: remaining });
      }
      break;
    }

    // Add text before the code fence
    if (fenceStart > currentIndex) {
      const text = normalizedInput.slice(currentIndex, fenceStart).trim();
      if (text) {
        blocks.push({ type: "text", content: text });
      }
    }

    // Find the language identifier (until newline)
    const langEnd = normalizedInput.indexOf("\n", fenceStart + 3);
    if (langEnd === -1) {
      // Malformed, add rest as text
      const remaining = normalizedInput.slice(fenceStart).trim();
      if (remaining) {
        blocks.push({ type: "text", content: remaining });
      }
      break;
    }

    const lang =
      normalizedInput.slice(fenceStart + 3, langEnd).trim() || "plaintext";

    // Find the closing fence - must be on its own line
    let fenceEnd = -1;
    let searchFrom = langEnd + 1;

    while (searchFrom < normalizedInput.length) {
      const nextFence = normalizedInput.indexOf("```", searchFrom);
      if (nextFence === -1) {
        break;
      }

      // Check if this fence is at start of line (or preceded by newline)
      const charBefore = nextFence > 0 ? normalizedInput[nextFence - 1] : "\n";
      if (charBefore === "\n" || nextFence === 0) {
        // Check if followed by newline or end of string (not another language identifier)
        const afterFence = normalizedInput.slice(nextFence + 3, nextFence + 4);
        if (afterFence === "" || afterFence === "\n" || afterFence === "\r") {
          fenceEnd = nextFence;
          break;
        }
      }
      searchFrom = nextFence + 3;
    }

    if (fenceEnd === -1) {
      // No closing fence found, treat rest as code
      const code = normalizedInput.slice(langEnd + 1).trim();
      blocks.push({
        type: "code",
        lang: lang.toLowerCase(),
        content: code,
      });
      break;
    }

    // Extract code content
    const code = normalizedInput.slice(langEnd + 1, fenceEnd).trim();
    blocks.push({
      type: "code",
      lang: lang.toLowerCase(),
      content: code,
    });

    // Move past the closing fence
    currentIndex = fenceEnd + 3;
    // Skip trailing newline after closing fence
    if (normalizedInput[currentIndex] === "\n") {
      currentIndex++;
    }
  }

  return blocks;
}

function isVegaLiteSpec(content: string): boolean {
  try {
    const parsed = JSON.parse(content);
    return (
      parsed.$schema?.includes("vega-lite") ||
      (parsed.mark && parsed.encoding) ||
      (parsed.layer && Array.isArray(parsed.layer))
    );
  } catch {
    return false;
  }
}

function extractVegaLiteFromMarkdown(content: string): string | null {
  // Try to extract vega-lite JSON from markdown content that may contain nested code blocks
  const jsonMatch = content.match(/```json\s*\n([\s\S]*?)(?:\n```|$)/);
  if (jsonMatch && isVegaLiteSpec(jsonMatch[1].trim())) {
    return jsonMatch[1].trim();
  }
  // Also try to find raw JSON object
  const jsonObjectMatch = content.match(
    /(\{[\s\S]*"(?:\$schema|mark|encoding)"[\s\S]*\})/,
  );
  if (jsonObjectMatch && isVegaLiteSpec(jsonObjectMatch[1])) {
    return jsonObjectMatch[1];
  }
  return null;
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
      // Auto-detect vega-lite specs in json blocks
      if (block.lang === "json" && isVegaLiteSpec(block.content)) {
        return { type: "vega-lite" as const, content: block.content };
      }
      // Try to extract vega-lite from markdown blocks with nested json
      if (block.lang === "markdown") {
        const vegaSpec = extractVegaLiteFromMarkdown(block.content);
        if (vegaSpec) {
          return { type: "vega-lite" as const, content: vegaSpec };
        }
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

export interface InlineToken {
  type: "text" | "link" | "bold" | "italic" | "code" | "boldItalic";
  content: string;
  href?: string;
}

export function parseInlineMarkdown(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  // Order matters: boldItalic before bold/italic, link before others
  const regex =
    /(\[([^\]]+)\]\(([^)]+)\))|(\*\*\*(.+?)\*\*\*)|(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+)`)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add preceding text
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    if (match[1]) {
      // Link: [text](url)
      tokens.push({ type: "link", content: match[2], href: match[3] });
    } else if (match[4]) {
      // Bold+Italic: ***text***
      tokens.push({ type: "boldItalic", content: match[5] });
    } else if (match[6]) {
      // Bold: **text**
      tokens.push({ type: "bold", content: match[7] });
    } else if (match[8]) {
      // Italic: *text*
      tokens.push({ type: "italic", content: match[9] });
    } else if (match[10]) {
      // Inline code: `code`
      tokens.push({ type: "code", content: match[11] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    tokens.push({ type: "text", content: text.slice(lastIndex) });
  }

  return tokens.length > 0 ? tokens : [{ type: "text", content: text }];
}

const languageMap: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  terminal: "bash",
  js: "javascript",
  ts: "typescript",
  tsx: "typescript",
  jsx: "javascript",
  py: "python",
  rb: "ruby",
  yml: "yaml",
  md: "markdown",
  plaintext: "bash",
  default: "bash",
  // C-family aliases
  "c++": "cpp",
  "c#": "csharp",
  dotnet: "csharp",
  // JVM languages
  kt: "kotlin",
  // Web
  html: "markup",
  xml: "markup",
  svg: "markup",
};

export function normalizeLanguage(lang: string): string {
  const lower = lang.toLowerCase();
  return languageMap[lower] || lower;
}
