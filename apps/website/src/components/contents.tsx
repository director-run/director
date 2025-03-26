import { cn } from "@director.run/ui/lib/cn";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export function Contents({
  children,
  className,
  style,
  ...props
}: React.ComponentProps<"ol">) {
  return (
    <ol
      className={cn("flex select-none flex-col gap-y-1", className)}
      style={{ counterReset: "count 0", ...style }}
      {...props}
    >
      {children}
    </ol>
  );
}

interface ContentsItemProps extends React.ComponentProps<"li"> {
  href: string;
}

export function ContentsItem({
  children,
  className,
  href,
  style,
  ...props
}: ContentsItemProps) {
  const isExternal = href.startsWith("http");

  return (
    <li {...props} style={{ counterIncrement: "count 1", ...style }}>
      <Link
        href={href}
        className={cn(
          "group/contents-item",
          "grid grid-cols-[28px_1fr_28px] gap-x-0.5",
          "*:bg-gray-4 *:last:rounded-r-xs dark:*:bg-gray-2",
          "*:transition-colors *:duration-200 *:ease-in-out hover:*:bg-gray-5 dark:hover:*:bg-gray-4",
          "before:flex before:size-7 before:items-center before:justify-center before:rounded-l-xs before:bg-gray-4 before:font-medium before:text-gray-10 before:uppercase before:content-[counter(count,_upper-alpha)] group-hover/contents-item:before:text-gray-11 dark:before:bg-gray-2",
          "before:transition-colors before:duration-200 before:ease-in-out hover:before:bg-gray-5 dark:hover:before:bg-gray-4",
          className,
        )}
      >
        <span className="truncate px-2 font-light leading-7 tracking-wide dark:font-extralight">
          {children}
        </span>
        <span
          className="flex size-7 items-center justify-center text-gray-10 group-hover/contents-item:text-gray-11"
          aria-hidden
        >
          {isExternal ? (
            <ArrowUpRight weight="bold" />
          ) : (
            <ArrowRight weight="bold" />
          )}
        </span>
      </Link>
    </li>
  );
}
