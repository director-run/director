import { assertUnreachable } from "@/lib/assert-unreachable";
import { cn } from "@/lib/cn";
import { ComponentProps, useId } from "react";

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
          id={`${type}-${id}`}
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
          width={typeof gap === "number" ? gap : gap.x}
          height={typeof gap === "number" ? gap : gap.y}
          patternUnits="userSpaceOnUse"
        >
          <rect x="1" y="1" width={size} height={size} fill="currentColor" />
        </pattern>
      );
    case "vertical-lines":
      return (
        <pattern
          id={`${type}-${id}`}
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
          width={typeof gap === "number" ? gap : gap.x}
          height={typeof gap === "number" ? gap : gap.y}
          patternUnits="userSpaceOnUse"
        >
          <rect x="0" y="0" width={size} height="100%" fill="currentColor" />
        </pattern>
      );
    case "horizontal-lines":
      return (
        <pattern
          id={`${type}-${id}`}
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
          width={typeof gap === "number" ? gap : gap.x}
          height={typeof gap === "number" ? gap : gap.y}
          patternUnits="userSpaceOnUse"
        >
          <rect x="0" y="0" width="100%" height={size} fill="currentColor" />
        </pattern>
      );
    case "crosshatch":
      return (
        <pattern
          id={`${type}-${id}`}
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
          width={typeof gap === "number" ? gap : gap.x}
          height={typeof gap === "number" ? gap : gap.y}
          patternUnits="userSpaceOnUse"
        >
          <rect x="0" y="2" width="100%" height={size} fill="currentColor" />
          <rect x="2" y="0" width={size} height="100%" fill="currentColor" />
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
      fill="none"
      className={cn("pointer-events-none h-full w-full select-none", className)}
      {...props}
    >
      <rect width="100%" height="100%" fill={`url(#${type}-${id})`}></rect>
      <defs>
        <PatternDefs
          type={type}
          id={id}
          gap={gap}
          size={size}
          patternOffset={patternOffset}
        />
      </defs>
    </svg>
  );
}
