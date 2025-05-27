import { cn } from "@/lib/cn";
import ReactMarkdown from "react-markdown";
import { textVariants } from "./typography";

export function Markdown({ children }: { children?: string }) {
  return (
    <div>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className={cn(textVariants({ variant: "h1" }))}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className={cn(textVariants({ variant: "h2" }))}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className={cn(textVariants({ variant: "h3" }))}>{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className={cn(textVariants({ variant: "h4" }))}>{children}</h4>
          ),
          p: ({ children }) => (
            <p className={cn(textVariants({ variant: "p" }), "[*+&]:mt-[1em]")}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul
              className={cn(
                textVariants({ variant: "p" }),
                "ml-4 list-disc marker:text-fg-subtle/50 [*+&]:mt-[1em]",
              )}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={cn(textVariants({ variant: "p" }), "[*+&]:mt-[1em]")}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li
              className={cn(textVariants({ variant: "p" }), "[*+&]:mt-[1em]")}
            >
              {children}
            </li>
          ),
          code: ({ children }) => <code className="font-mono">{children}</code>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
