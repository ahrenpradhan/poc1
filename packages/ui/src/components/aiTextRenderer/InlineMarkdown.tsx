import { parseInlineMarkdown } from "./utils";

export function InlineMarkdown({ text }: { text: string }) {
  const tokens = parseInlineMarkdown(text);

  return (
    <>
      {tokens.map((token, i) => {
        switch (token.type) {
          case "image":
            return (
              <img
                key={i}
                src={token.href}
                alt={token.content || "image"}
                className="max-w-full h-auto rounded-lg my-2 inline-block"
                loading="lazy"
              />
            );
          case "link":
            return (
              <a
                key={i}
                href={token.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline"
              >
                {token.content}
              </a>
            );
          case "bold":
            return <strong key={i}>{token.content}</strong>;
          case "italic":
            return <em key={i}>{token.content}</em>;
          case "boldItalic":
            return (
              <strong key={i}>
                <em>{token.content}</em>
              </strong>
            );
          case "code":
            return (
              <code
                key={i}
                className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 rounded text-sm font-mono"
              >
                {token.content}
              </code>
            );
          default:
            return <span key={i}>{token.content}</span>;
        }
      })}
    </>
  );
}
