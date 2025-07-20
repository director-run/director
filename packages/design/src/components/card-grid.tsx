import { cn } from "@director.run/design/lib/cn";
import type { ComponentProps } from "react";

export function CardGrid({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className="@container/card-grid" data-slot="card-grid">
      <div
        className={cn(
          "grid @3xl/card-grid:grid-cols-3 @xl/card-grid:grid-cols-2 grid-cols-1 @3xl/card-grid:gap-4 @xl/card-grid:gap-3 gap-2.5",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
