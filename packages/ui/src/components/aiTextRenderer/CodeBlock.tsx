import { useState, useEffect } from "react";
import { Highlight, themes, Prism } from "prism-react-renderer";
import { normalizeLanguage } from "./utils";

// Register additional languages that aren't bundled by default
// We need to do this at module load time
const registerAdditionalLanguages = () => {
  // Java language definition
  (Prism.languages as Record<string, unknown>).java = {
    comment: {
      pattern: /\/\*[\s\S]*?\*\/|\/\/.*/,
      greedy: true,
    },
    string: {
      pattern: /(^|[^\\])"(?:\\.|[^"\\])*"/,
      lookbehind: true,
      greedy: true,
    },
    char: {
      pattern: /'(?:\\.|[^'\\])'/,
      greedy: true,
    },
    keyword:
      /\b(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|exports|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|module|native|new|non-sealed|null|open|opens|package|permits|private|protected|provides|public|record|requires|return|sealed|short|static|strictfp|super|switch|synchronized|this|throw|throws|to|transient|transitive|try|uses|var|void|volatile|while|with|yield)\b/,
    boolean: /\b(?:false|true)\b/,
    function: /\b\w+(?=\()/,
    number:
      /\b0b[01][01_]*L?\b|\b0x(?:\.[\da-f_p+-]+|[\da-f_]+(?:\.[\da-f_p+-]+)?)\b|(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?\d[\d_]*)?[dfl]?/i,
    operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
    punctuation: /[{}[\];(),.:]/,
    annotation: {
      pattern: /@\w+/,
      alias: "builtin",
    },
  };

  // Rust language definition
  (Prism.languages as Record<string, unknown>).rust = {
    comment: {
      pattern: /\/\/.*|\/\*[\s\S]*?\*\//,
      greedy: true,
    },
    string: {
      pattern: /b?"(?:\\.|[^"\\])*"|b?r(#*)"[\s\S]*?"\1/,
      greedy: true,
    },
    char: {
      pattern:
        /b?'(?:\\(?:x[0-7][\da-fA-F]|u\{(?:[\da-fA-F]_*){1,6}\}|.)|[^\\\r\n\t'])'/,
      greedy: true,
    },
    keyword:
      /\b(?:Self|abstract|as|async|await|become|box|break|const|continue|crate|do|dyn|else|enum|extern|final|fn|for|if|impl|in|let|loop|macro|match|mod|move|mut|override|priv|pub|ref|return|self|static|struct|super|trait|try|type|typeof|union|unsafe|unsized|use|virtual|where|while|yield)\b/,
    boolean: /\b(?:false|true)\b/,
    function: /\b\w+(?=\()/,
    number:
      /\b(?:0b[01_]+|0o[0-7_]+|0x[\da-fA-F_]+|\d[\d_]*(?:\.[\d_]+)?(?:[Ee][+-]?[\d_]+)?)[iu]?(?:8|16|32|64|128|size)?\b/,
    operator: /[-+*/%!^]=?|=[=>]?|&[&=]?|\|[|=]?|<<?=?|>>?=?|[@?]/,
    punctuation: /[{}[\];(),.:]/,
    attribute: {
      pattern: /#!?\[.*?\]/,
      greedy: true,
      alias: "attr-name",
    },
    "macro-rules": {
      pattern: /\b\w+!/,
      alias: "function",
    },
  };

  // Kotlin language definition
  (Prism.languages as Record<string, unknown>).kotlin = {
    comment: {
      pattern: /\/\*[\s\S]*?\*\/|\/\/.*/,
      greedy: true,
    },
    string: {
      pattern: /"""[\s\S]*?"""|"(?:[^"\\]|\\.)*"/,
      greedy: true,
    },
    keyword:
      /\b(?:abstract|actual|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|else|enum|expect|external|final|finally|for|fun|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|null|object|open|operator|out|override|package|private|protected|public|reified|return|sealed|super|suspend|tailrec|this|throw|to|try|typealias|val|var|vararg|when|where|while)\b/,
    boolean: /\b(?:false|true)\b/,
    function: /\b\w+(?=\()/,
    number:
      /\b(?:0[xX][\da-fA-F]+(?:_[\da-fA-F]+)*|0[bB][01]+(?:_[01]+)*|\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?[fFL]?)\b/,
    operator: /[<>!=]=?|[?:]+|[-+*/%&|^!~]=?/,
    punctuation: /[{}[\];(),.:]/,
    annotation: {
      pattern: /@\w+/,
      alias: "builtin",
    },
  };

  // Python language definition
  (Prism.languages as Record<string, unknown>).python = {
    comment: {
      pattern: /#.*/,
      greedy: true,
    },
    "string-interpolation": {
      pattern:
        /(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,
      greedy: true,
      inside: {
        interpolation: {
          pattern:
            /((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,
          lookbehind: true,
          inside: {
            "format-spec": {
              pattern: /(:)[^:(){}]+(?=\}$)/,
              lookbehind: true,
            },
            "conversion-option": {
              pattern: /![sra](?=[:}]$)/,
              alias: "punctuation",
            },
          },
        },
        string: /[\s\S]+/,
      },
    },
    "triple-quoted-string": {
      pattern: /(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,
      greedy: true,
      alias: "string",
    },
    string: {
      pattern: /(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,
      greedy: true,
    },
    function: {
      pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/,
      lookbehind: true,
    },
    "class-name": {
      pattern: /(\bclass\s+)\w+/i,
      lookbehind: true,
    },
    decorator: {
      pattern: /(^[\t ]*)@\w+(?:\.\w+)*/m,
      lookbehind: true,
      alias: ["annotation", "punctuation"],
      inside: {
        punctuation: /\./,
      },
    },
    keyword:
      /\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,
    builtin:
      /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|print|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
    boolean: /\b(?:False|None|True)\b/,
    number:
      /\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?\b/i,
    operator: /[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
    punctuation: /[{}[\];(),.:]/,
  };

  // Markdown language definition - simple version for displaying raw markdown
  (Prism.languages as Record<string, unknown>).markdown = {
    // Code fences - just highlight the fence line itself
    "code-fence": {
      pattern: /^```[\w-]*$/m,
      alias: "comment",
    },
    // Headers
    title: {
      pattern: /^#{1,6}.+$/m,
      alias: "important",
    },
    // Inline code
    "inline-code": {
      pattern: /`[^`\n]+`/,
      alias: "keyword",
    },
    // Links
    url: {
      pattern: /\[[^\]]+\]\([^)]+\)/,
      alias: "url",
    },
    // Images
    image: {
      pattern: /!\[[^\]]*\]\([^)]+\)/,
      alias: "url",
    },
    // Bold
    bold: {
      pattern: /\*\*[^*]+\*\*/,
      alias: "important",
    },
    // Italic
    italic: {
      pattern: /(?<!\*)\*[^*]+\*(?!\*)/,
      alias: "italic",
    },
    // Lists
    list: {
      pattern: /^[\t ]*[-*+](?=\s)/m,
      alias: "punctuation",
    },
    // Numbered lists
    "numbered-list": {
      pattern: /^[\t ]*\d+\.(?=\s)/m,
      alias: "punctuation",
    },
    // Blockquotes
    blockquote: {
      pattern: /^>/m,
      alias: "punctuation",
    },
  };

  // PHP language definition
  (Prism.languages as Record<string, unknown>).php = {
    comment: {
      pattern: /\/\*[\s\S]*?\*\/|\/\/.*|#.*/,
      greedy: true,
    },
    string: {
      pattern: /(['"])(?:\\[\s\S]|(?!\1)[^\\])*\1/,
      greedy: true,
    },
    keyword:
      /\b(?:abstract|and|array|as|break|callable|case|catch|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|eval|exit|extends|final|finally|fn|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|match|namespace|new|or|parent|print|private|protected|public|readonly|require|require_once|return|self|static|switch|throw|trait|try|unset|use|var|while|xor|yield)\b/i,
    boolean: /\b(?:false|true)\b/i,
    function: /\b\w+(?=\()/,
    number: /\b(?:0b[01]+|0o[0-7]+|0x[\da-f]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/i,
    operator: /[<>!=]=?=?|[?:]+|[-+*/%&|^!~]=?|\.\.\./,
    punctuation: /[{}[\];(),.:]/,
    variable: /\$\w+/,
  };

  // C# language definition
  (Prism.languages as Record<string, unknown>).csharp = {
    comment: {
      pattern: /\/\*[\s\S]*?\*\/|\/\/.*/,
      greedy: true,
    },
    string: {
      pattern: /@"[^"]*(?:""[^"]*)*"|"(?:\\.|[^"\\])*"/,
      greedy: true,
    },
    keyword:
      /\b(?:abstract|as|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while)\b/,
    boolean: /\b(?:false|true)\b/,
    function: /\b\w+(?=\()/,
    number: /\b(?:0x[\da-f]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?[fdm]?)\b/i,
    operator: /[<>!=]=?|[?:]+|[-+*/%&|^!~]=?|\?\?/,
    punctuation: /[{}[\];(),.:]/,
  };
  (Prism.languages as Record<string, unknown>).cs = (
    Prism.languages as Record<string, unknown>
  ).csharp;

  // C++ language definition (extends C)
  (Prism.languages as Record<string, unknown>).cpp = {
    comment: {
      pattern: /\/\*[\s\S]*?\*\/|\/\/.*/,
      greedy: true,
    },
    string: {
      pattern: /(?:u8?|U|L)?(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*')/,
      greedy: true,
    },
    keyword:
      /\b(?:alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|class|const|const_cast|constexpr|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|false|final|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|nullptr|operator|override|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|true|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/,
    boolean: /\b(?:false|true)\b/,
    function: /\b\w+(?=\()/,
    number:
      /(?:\b0x(?:[\da-f]+(?:\.[\da-f]*)?|\.[\da-f]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i,
    operator: /--|\+\+|&&|\|\||<<=?|>>=?|->|::|[?:~]|[<>!=]=?|[-+*/%&|^]=?/,
    punctuation: /[{}[\];(),.:]/,
  };

  // TypeScript (extends JavaScript which is already included)
  (Prism.languages as Record<string, unknown>).typescript = {
    ...((Prism.languages as Record<string, unknown>).javascript as object),
    keyword:
      /\b(?:abstract|any|as|asserts|async|await|bigint|boolean|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|is|keyof|let|module|namespace|never|new|null|number|object|of|package|private|protected|public|readonly|require|return|set|static|string|super|switch|symbol|this|throw|true|try|type|typeof|undefined|unique|unknown|var|void|while|with|yield)\b/,
  };
};

// Register languages once
registerAdditionalLanguages();

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
