import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { normalizeLanguage } from "./utils";

// Cast Highlight to work around React type version mismatch
const HighlightComponent = Highlight as React.ComponentType<{
  theme: typeof themes.oneDark;
  code: string;
  language: string;
  children: (props: {
    style: React.CSSProperties;
    tokens: { types: string[]; content: string; empty?: boolean }[][];
    getLineProps: (input: {
      line: { types: string[]; content: string }[];
    }) => object;
    getTokenProps: (input: {
      token: { types: string[]; content: string };
    }) => object;
  }) => React.ReactNode;
}>;

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-600"
      title="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const normalizedLang = normalizeLanguage(language);
  const displayLang = language === "default" ? "" : language;

  return (
    <div className="relative my-2">
      <div className="absolute right-2 top-2 flex items-center gap-2">
        {displayLang && (
          <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
            {displayLang}
          </span>
        )}
        <CopyButton code={code} />
      </div>
      <HighlightComponent
        theme={themes.oneDark}
        code={code}
        language={normalizedLang}
      >
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="overflow-x-auto rounded-md p-4 pt-10 text-sm"
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </HighlightComponent>
    </div>
  );
}
