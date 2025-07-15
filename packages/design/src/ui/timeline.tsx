"use client";

import { cn } from "@director.run/design/lib/cn";
import { createCtx } from "@director.run/design/lib/create-ctx";
import { Slot } from "radix-ui";
import { type HTMLAttributes, useCallback, useState } from "react";

const [useTimeline, TimelineProvider] = createCtx<{
  activeStep: number;
  setActiveStep: (step: number) => void;
}>();

interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  orientation?: "horizontal" | "vertical";
}

function Timeline({
  defaultValue = 1,
  value,
  onValueChange,
  orientation = "vertical",
  className,
  ...props
}: TimelineProps) {
  const [activeStep, setInternalStep] = useState(defaultValue);

  const setActiveStep = useCallback(
    (step: number) => {
      if (value === undefined) {
        setInternalStep(step);
      }
      onValueChange?.(step);
    },
    [value, onValueChange],
  );

  const currentStep = value ?? activeStep;

  return (
    <TimelineProvider value={{ activeStep: currentStep, setActiveStep }}>
      <div
        className={cn(
          "group/timeline flex",
          "radix-orientation-[horizontal]:w-full radix-orientation-[horizontal]:flex-row",
          "radix-orientation-[vertical]:flex-col",
          className,
        )}
        data-orientation={orientation}
        data-slot="timeline"
        {...props}
      />
    </TimelineProvider>
  );
}

function TimelineContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-content-secondary text-sm", className)}
      data-slot="timeline-content"
      {...props}
    />
  );
}

interface TimelineDateProps extends HTMLAttributes<HTMLTimeElement> {
  asChild?: boolean;
}

function TimelineDate({
  asChild = false,
  className,
  ...props
}: TimelineDateProps) {
  const Comp = asChild ? Slot.Root : "time";

  return (
    <Comp
      className={cn(
        "block font-medium font-mono text-content-secondary text-xs uppercase leading-4 tracking-wide",
        className,
      )}
      data-slot="timeline-date"
      {...props}
    />
  );
}

function TimelineHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-y-1.5", className)}
      data-slot="timeline-header"
      {...props}
    />
  );
}

interface TimelineIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

function TimelineIndicator({
  asChild = false,
  className,
  children,
  ...props
}: TimelineIndicatorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute flex size-5 items-center justify-center rounded-full border-2 border-base/25",
        "group-data-[orientation=horizontal]/timeline:-top-6 group-data-[orientation=horizontal]/timeline:-translate-y-1/2 group-data-[orientation=horizontal]/timeline:left-0",
        "group-data-[orientation=vertical]/timeline:-left-6 group-data-[orientation=vertical]/timeline:-translate-x-1/2 group-data-[orientation=vertical]/timeline:-top-0.75",
        "group-data-completed/timeline-item:border-none group-data-completed/timeline-item:bg-sentiment-positive group-data-completed/timeline-item:text-base",
        className,
      )}
      data-slot="timeline-indicator"
      {...props}
    >
      {children}
    </div>
  );
}

interface TimelineItemProps extends HTMLAttributes<HTMLDivElement> {
  step: number;
}

function TimelineItem({ step, className, ...props }: TimelineItemProps) {
  const { activeStep } = useTimeline();

  return (
    <div
      className={cn(
        "group/timeline-item relative flex flex-1 flex-col gap-0.5",
        "group-data-[orientation=vertical]/timeline:ms-8 group-data-[orientation=vertical]/timeline:not-last:pb-12",
        "group-data-[orientation=horizontal]/timeline:mt-8 group-data-[orientation=horizontal]/timeline:not-last:pe-8",
        "data-completed:has-[+[data-completed]]:[&_[data-slot=timeline-separator]]:bg-base",
        className,
      )}
      data-completed={step <= activeStep || undefined}
      data-slot="timeline-item"
      {...props}
    />
  );
}

function TimelineSeparator({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute self-start bg-base/25",
        "group-data-[orientation=horizontal]/timeline:-top-6 group-data-[orientation=horizontal]/timeline:-translate-y-1/2 group-data-[orientation=horizontal]/timeline:h-0.5 group-data-[orientation=horizontal]/timeline:w-[calc(100%-1rem-0.25rem)] group-data-[orientation=horizontal]/timeline:translate-x-4.5",
        "group-data-[orientation=vertical]/timeline:-left-6 group-data-[orientation=vertical]/timeline:-translate-x-1/2 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.25rem-0.375rem)] group-data-[orientation=vertical]/timeline:w-0.5 group-data-[orientation=vertical]/timeline:translate-y-5",
        "group-last/timeline-item:hidden ",
        className,
      )}
      data-slot="timeline-separator"
      {...props}
    />
  );
}

function TimelineTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-pretty font-normal text-sm [[data-completed]_&]:text-content-primary",
        className,
      )}
      data-slot="timeline-title"
      {...props}
    />
  );
}

export {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
};
