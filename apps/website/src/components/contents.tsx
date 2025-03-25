import { cn } from "@director.run/ui/lib/cn";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const ABC = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export function Contents({
  children,
  className,
  ...props
}: React.ComponentProps<"ol">) {
  return (
    <ol
      className={cn("flex select-none flex-col gap-y-1", className)}
      {...props}
    >
      {children}
    </ol>
  );
}

interface ContentsItemProps extends React.ComponentProps<"li"> {
  href: string;
  position: number;
}

export function ContentsItem({
  children,
  className,
  href,
  position,
  ...props
}: ContentsItemProps) {
  const isExternal = href.startsWith("http");

  return (
    <li {...props}>
      <Link
        href={href}
        className={cn(
          "group/contents-item",
          "grid grid-cols-[28px_1fr_28px] gap-x-0.5",
          "*:bg-gray-4 *:first:rounded-l-xs *:last:rounded-r-xs dark:*:bg-gray-2",
          "*:transition-colors *:duration-200 *:ease-in-out hover:*:bg-gray-5 dark:hover:*:bg-gray-4",
          className,
        )}
      >
        <span className="flex size-7 items-center justify-center font-medium text-gray-10 uppercase group-hover/contents-item:text-gray-11">
          {ABC[position]}
        </span>
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
