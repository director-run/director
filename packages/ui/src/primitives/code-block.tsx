import { cn } from "@/lib/cn";
import * as React from "react";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";

interface CodeBlockProps extends React.ComponentProps<"div"> {
  children: string;
  lang: BundledLanguage;
}

export async function CodeBlock({
  className,
  children,
  lang,
  ...props
}: CodeBlockProps) {
  const out = await codeToHtml(children, {
    lang: lang,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    colorReplacements: {
      "github-light": {
        "#fff": "oklch(0.9551 0 0)",
      },
      "github-dark": {
        "#24292e": "oklch(0.2134 0 0)",
      },
    },
  });

  return (
    <div
      className={cn(
        "[&>pre]:z-1 [&>pre]:overflow-x-auto [&>pre]:bg-transparent [>pre]:relative",
        "[&>pre]:ltr [&>pre]:tab-4 [&>pre]:hyphens-none [&>pre]:whitespace-pre [&>pre]:break-normal [&>pre]:text-left [&>pre]:normal-case",
        "[&>pre]:margin-0 [&>pre]:rounded-sm [&>pre]:border [&>pre]:border-border/50 [&>pre]:py-4",
        "[&>pre>code]:block [&>pre>code]:w-fit [&>pre>code]:min-w-full [&>pre>code]:px-4",
        "[&>pre>code]:ltr [&>pre>code]:tab-4 [&>pre>code]:hyphens-none [&>pre>code]:whitespace-pre [&>pre>code]:break-normal [&>pre>code]:text-left [&>pre>code]:normal-case",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: out }}
      {...props}
    />
  );
}
