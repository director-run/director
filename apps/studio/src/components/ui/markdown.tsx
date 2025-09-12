import { cn } from "../../helpers/cn";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export function SimpleMarkdown({
  children,
}: {
  children: string;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      allowElement={(element) => {
        if (
          ["a", "p", "strong", "i", "u", "s", "code"].includes(element.tagName)
        ) {
          return true;
        }

        return false;
      }}
      components={{
        p: ({ children }) => <>{children}</>,
        a: ({ children, href }) => (
          <a
            className="text-fg underline"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-[450]">{children}</strong>
        ),
        i: ({ children }) => <i className="text-fg">{children}</i>,
        u: ({ children }) => <u className="underline">{children}</u>,
        s: ({ children }) => <s className="line-through">{children}</s>,
        code: ({ children }) => (
          <code className="rounded-md bg-accent px-1 font-mono">
            {children}
          </code>
        ),
      }}
    >
      {children.replaceAll("\n", " ")}
    </ReactMarkdown>
  );
}

export function Markdown({
  children,
  className,
}: {
  children?: string;
  className?: string;
}) {
  return (
    <div className={cn("prose", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          table: ({ children }) => (
            <div className="max-w-full overflow-x-auto overflow-y-auto">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
