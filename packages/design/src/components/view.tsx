"use client";

import { cn } from "@director.run/design/lib/cn";
import { createCtx } from "@director.run/design/lib/create-ctx";
import { Button } from "@director.run/design/ui/button";
import { PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react";
import { Slot } from "radix-ui";
import { type ComponentProps, useState } from "react";

const [useContext, ContextProvider] = createCtx<{
  sidePanel?: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  };
}>();

export const useViewContext = useContext;

export function View({ className, ...props }: ComponentProps<"div">) {
  const [sidePanelIsOpen, setSidePanelIsOpen] = useState(false);

  return (
    <ContextProvider
      value={{
        sidePanel: { isOpen: sidePanelIsOpen, setIsOpen: setSidePanelIsOpen },
      }}
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden",
          className,
        )}
        data-slot="view"
        {...props}
      />
    </ContextProvider>
  );
}

export function ViewPanels({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("relative flex h-full flex-row overflow-hidden", className)}
      data-slot="view-panels"
      {...props}
    />
  );
}

export function ViewPanel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col overflow-hidden",
        "[&+[data-slot=view-panel]]:border-l-hairline",
        className,
      )}
      data-slot="view-panel"
      {...props}
    />
  );
}

export function ViewSidePanel({
  className,
  ...props
}: ComponentProps<typeof ViewPanel>) {
  const { sidePanel } = useViewContext();

  if (!sidePanel) {
    return null;
  }

  return (
    <ViewPanel
      className={cn(
        "absolute inset-y-0 right-0 z-10 w-full max-w-80 bg-surface-subtle md:static md:translate-x-0 md:bg-surface md:shadow-none [[data-slot=view-panel]+&]:border-l-0 md:[[data-slot=view-panel]+&]:border-l-hairline",
        "transition-transform duration-300 ease-in-out",
        sidePanel.isOpen
          ? "translate-x-0 shadow-popover"
          : "translate-x-full shadow-none",
        className,
      )}
      {...props}
    />
  );
}

export function ViewSidePanelTrigger({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const { sidePanel } = useViewContext();

  if (!sidePanel) {
    return null;
  }

  return (
    <Button
      className={cn("md:hidden", className)}
      onClick={() => sidePanel.setIsOpen(!sidePanel.isOpen)}
      size="sm"
      tooltip={sidePanel.isOpen ? "Hide details panel" : "Show details panel"}
      tooltipProps={{
        disableHoverableContent: true,
        delayDuration: 1000,
      }}
      variant="tertiary"
      {...props}
    >
      {sidePanel.isOpen ? <PanelRightCloseIcon /> : <PanelRightOpenIcon />}
      <span className="sr-only">{sidePanel.isOpen ? "Close" : "Open"}</span>
    </Button>
  );
}

export function ViewHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-12 shrink-0 flex-row items-center gap-x-4 border-b-hairline px-4",
        className,
      )}
      data-slot="view-header"
      {...props}
    />
  );
}

export function ViewPanelContent({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "@container/view-content flex grow flex-col overflow-y-auto overflow-x-hidden pb-[15dvh]",
        className,
      )}
      data-slot="view-content"
      {...props}
    />
  );
}

export function ViewNavigation({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex overflow-hidden",
        "to:transparent after:absolute after:top-0 after:right-0 after:bottom-px after:w-8 after:bg-gradient-to-l after:from-surface",
      )}
    >
      <div
        className={cn(
          "no-scrollbar flex flex-row gap-x-0 overflow-x-auto overflow-y-hidden pr-8",
          className,
        )}
        data-slot="view-navigation"
        {...props}
      />
    </div>
  );
}

interface ViewNavigationLinkProps extends ComponentProps<"a"> {
  asChild?: boolean;
  isSelected?: boolean;
}

export function ViewNavigationLink({
  asChild,
  className,
  children,
  isSelected,
  ...props
}: ViewNavigationLinkProps) {
  const Comp = asChild ? Slot.Root : "a";

  return (
    <Comp
      className={cn(
        "group flex h-12 shrink-0 cursor-pointer items-center border-transparent border-b-2 px-2.5 pt-0.5",
        "transition-colors duration-150 ease-in-out",
        "data-[state=selected]:border-base data-[state=unselected]:hover:border-border",
        "text-[13px] data-[state=selected]:font-[450] data-[state=selected]:text-content-primary data-[state=unselected]:text-content-secondary",
        "focus-visible:[&>span]:rounded focus-visible:[&>span]:ring-2 focus-visible:[&>span]:ring-interactive-primary focus-visible:[&>span]:ring-offset-2 focus-visible:[&>span]:ring-offset-background dark:[&>span]:ring-interactive-accent",
        className,
      )}
      data-slot="view-navigation-link"
      data-state={isSelected ? "selected" : "unselected"}
      {...props}
    >
      {children}
    </Comp>
  );
}
