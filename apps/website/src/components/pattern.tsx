import { assertUnreachable } from "@/lib/assert-unreachable";
import { cn } from "@/lib/cn";
import { ComponentProps, useId } from "react";

type PatternType =
  | "dots"
  | "crosshatch"
  | "vertical-lines"
  | "horizontal-lines";

type NumberOrCoordinate = number | { x: number; y: number };

interface PatternDefsProps {
  id: string;
  type: PatternType;
  gap?: NumberOrCoordinate;
  offset?: NumberOrCoordinate;
  strokeWidth?: number;
}

function PatternDefs({
  type,
  id,
  gap = 5,
  strokeWidth = 0.75,
  offset,
}: PatternDefsProps) {
  switch (type) {
    case "dots":
      return (
        <pattern
          id={`${type}-${id}`}
          x={offset ? (typeof offset === "number" ? offset : offset.x) : 1}
          y={offset ? (typeof offset === "number" ? offset : offset.y) : 1}
          width={typeof gap === "number" ? gap : gap.x}
          height={typeof gap === "number" ? gap : gap.y}
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r={strokeWidth} fill="currentColor" />
        </pattern>
      );
    case "vertical-lines":
      return (
        <pattern
          id={`${type}-${id}`}
          x={offset ? (typeof offset === "number" ? offset : offset.x) : 0}
          y={offset ? (typeof offset === "number" ? offset : offset.y) : 0}
          width={typeof gap === "number" ? gap : gap.x}
          height={typeof gap === "number" ? gap : gap.y}
          patternUnits="userSpaceOnUse"
        >
          <rect
            x="0"
            y="0"
            width={strokeWidth}
            height="100%"
            fill="currentColor"
          />
        </pattern>
      );
    case "horizontal-lines":
      return (
        <pattern
          id={`${type}-${id}`}
          x={offset ? (typeof offset === "number" ? offset : offset.x) : 2}
          y={offset ? (typeof offset === "number" ? offset : offset.y) : 0}
          width={typeof gap === "number" ? gap : gap.x}
          height={typeof gap === "number" ? gap : gap.y}
          patternUnits="userSpaceOnUse"
        >
          <rect
            x="0"
            y="0"
            width="100%"
            height={strokeWidth}
            fill="currentColor"
          />
        </pattern>
      );
    case "crosshatch":
      return (
        <pattern
          id={`${type}-${id}`}
          x={offset ? (typeof offset === "number" ? offset : offset.x) : 0}
          y={offset ? (typeof offset === "number" ? offset : offset.y) : 0}
          width={typeof gap === "number" ? gap : gap.x}
          height={typeof gap === "number" ? gap : gap.y}
          patternUnits="userSpaceOnUse"
        >
          <rect
            x="0"
            y="2"
            width="100%"
            height={strokeWidth}
            fill="currentColor"
          />
          <rect
            x="2"
            y="0"
            width={strokeWidth}
            height="100%"
            fill="currentColor"
          />
        </pattern>
      );
    default:
      assertUnreachable(type);
  }
}

interface PatternProps extends ComponentProps<"svg"> {
  type: PatternType;
  gap?: NumberOrCoordinate;
  patternOffset?: NumberOrCoordinate;
  strokeWidth?: number;
}

export function Pattern({
  className,
  type,
  gap,
  patternOffset,
  strokeWidth,
  ...props
}: PatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      height="100%"
      width="100%"
      fill="none"
      className={cn("pointer-events-none select-none", className)}
      {...props}
    >
      <rect width="100%" height="100%" fill={`url(#${type}-${id})`}></rect>
      <defs>
        <PatternDefs
          type={type}
          id={id}
          gap={gap}
          strokeWidth={strokeWidth}
          offset={patternOffset}
        />
      </defs>
    </svg>
  );
}
