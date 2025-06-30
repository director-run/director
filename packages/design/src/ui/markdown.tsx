import { cn } from "@director.run/design/lib/cn";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export function SimpleMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      allowElement={(element) => {
        if (
          ["a", "p", "strong", "i", "u", "s", "code", "br"].includes(
            element.tagName,
          )
        ) {
          return true;
        }

        return false;
      }}
      components={{
        p: (props) => <>{props.children}</>,
      }}
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
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
    <div className={cn("prose max-w-none", className)}>
      <ReactMarkdown
        components={{
          table: (props) => (
            <div className="max-w-full overflow-x-auto overflow-y-auto">
              <table>{props.children}</table>
            </div>
          ),
          summary: (props) => (
            <summary className="focus-visible">{props.children}</summary>
          ),
        }}
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
