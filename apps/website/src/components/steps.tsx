import { cn } from "@director.run/ui/lib/cn";

export function Steps({
  children,
  className,
  style,
  ...props
}: React.ComponentProps<"ol">) {
  return (
    <ol
      className={cn("flex flex-col gap-y-6 marker:text-gray-10", className)}
      style={{ counterReset: "count 0", ...style }}
      {...props}
    >
      {children}
    </ol>
  );
}

interface StepProps extends React.ComponentProps<"li"> {
  title: string;
}

export function Step({
  children,
  className,
  style,
  title,
  ...props
}: StepProps) {
  return (
    <li
      className={cn(
        "grid grid-cols-[auto_1fr] gap-x-4",
        "before:content-[counter(count,_decimal)]",
        "before:flex before:items-center before:justify-center",
        "before:font-light before:font-mono before:text-gray-10 before:text-sm before:leading-6 before:tracking-widest",
        "before:size-7 before:rounded-xs before:bg-gray-12 before:text-gray-1",
        className,
      )}
      style={{ counterIncrement: "count 1", ...style }}
      {...props}
    >
      <div className="flex flex-col gap-y-2 text-gray-11">
        <h3 className="text-pretty font-normal font-sans text-gray-12 text-lg leading-7 tracking-wider dark:font-light">
          {title}
        </h3>
        {children}
      </div>
    </li>
  );
}
