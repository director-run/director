import { assertUnreachable } from "@director.run/design/lib/assert-unreachable";
import { cn } from "@director.run/design/lib/cn";
import { Separator as SeparatorPrimitive } from "radix-ui";
import { type ComponentProps, useId } from "react";

type PatternType =
  | "dots"
  | "crosshatch"
  | "vertical-lines"
  | "horizontal-lines";

type NumberOrCoordinate = number | { x: number; y: number };

export interface PatternDefsProps {
  id: string;
  type: PatternType;
  gap?: NumberOrCoordinate;
  patternOffset?: NumberOrCoordinate;
  size?: number;
}

function PatternDefs({
  type,
  id,
  gap = 5,
  size = 0.75,
  patternOffset,
}: PatternDefsProps) {
  switch (type) {
    case "dots":
      return (
        <pattern
          height={typeof gap === "number" ? gap : gap.y}
          id={`${type}-${id}`}
          patternUnits="userSpaceOnUse"
          width={typeof gap === "number" ? gap : gap.x}
          x={
            patternOffset
              ? typeof patternOffset === "number"
                ? patternOffset
                : patternOffset.x
              : 0
          }
          y={
            patternOffset
              ? typeof patternOffset === "number"
                ? patternOffset
                : patternOffset.y
              : 0
          }
        >
          <rect fill="currentColor" height={size} width={size} x="1" y="1" />
        </pattern>
      );
    case "vertical-lines":
      return (
        <pattern
          height={typeof gap === "number" ? gap : gap.y}
          id={`${type}-${id}`}
          patternUnits="userSpaceOnUse"
          width={typeof gap === "number" ? gap : gap.x}
          x={
            patternOffset
              ? typeof patternOffset === "number"
                ? patternOffset
                : patternOffset.x
              : 0
          }
          y={
            patternOffset
              ? typeof patternOffset === "number"
                ? patternOffset
                : patternOffset.y
              : 0
          }
        >
          <rect fill="currentColor" height="100%" width={size} x="0" y="0" />
        </pattern>
      );
    case "horizontal-lines":
      return (
        <pattern
          height={typeof gap === "number" ? gap : gap.y}
          id={`${type}-${id}`}
          patternUnits="userSpaceOnUse"
          width={typeof gap === "number" ? gap : gap.x}
          x={
            patternOffset
              ? typeof patternOffset === "number"
                ? patternOffset
                : patternOffset.x
              : 2
          }
          y={
            patternOffset
              ? typeof patternOffset === "number"
                ? patternOffset
                : patternOffset.y
              : 0
          }
        >
          <rect fill="currentColor" height={size} width="100%" x="0" y="0" />
        </pattern>
      );
    case "crosshatch":
      return (
        <pattern
          height={typeof gap === "number" ? gap : gap.y}
          id={`${type}-${id}`}
          patternUnits="userSpaceOnUse"
          width={typeof gap === "number" ? gap : gap.x}
          x={
            patternOffset
              ? typeof patternOffset === "number"
                ? patternOffset
                : patternOffset.x
              : 0
          }
          y={
            patternOffset
              ? typeof patternOffset === "number"
                ? patternOffset
                : patternOffset.y
              : 0
          }
        >
          <rect fill="currentColor" height={size} width="100%" x="0" y="2" />
          <rect fill="currentColor" height="100%" width={size} x="2" y="0" />
        </pattern>
      );
    default:
      assertUnreachable(type);
  }
}

export interface PatternProps extends ComponentProps<"svg"> {
  type: PatternType;
  gap?: NumberOrCoordinate;
  patternOffset?: NumberOrCoordinate;
  size?: number;
}

export function Pattern({
  className,
  type,
  gap,
  patternOffset,
  size,
  ...props
}: PatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none h-full w-full select-none", className)}
      fill="none"
      {...props}
    >
      <rect fill={`url(#${type}-${id})`} height="100%" width="100%" />
      <defs>
        <PatternDefs
          gap={gap}
          id={id}
          patternOffset={patternOffset}
          size={size}
          type={type}
        />
      </defs>
    </svg>
  );
}

interface PatternSeparatorProps
  extends Omit<ComponentProps<"div">, "children"> {
  pattern: Omit<PatternDefsProps, "id">;
}

export function PatternSeparator({
  pattern,
  className,
  ...props
}: PatternSeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      className={cn(
        "relative h-4 w-full text-border dark:text-border/80",
        className,
      )}
      data-slot="separator"
      {...props}
    >
      <Pattern className="absolute inset-0 text-current" {...pattern} />
    </SeparatorPrimitive.Root>
  );
}
