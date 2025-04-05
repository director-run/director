import { cn } from "@/lib/cn";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { Slot } from "@radix-ui/react-slot";
import { ChevronDownIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";

export function Menu({
  children,
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) {
  return (
    <div className={cn("flex grow flex-col", className)} {...props}>
      {children}
    </div>
  );
}

interface MenuGroupProps extends React.ComponentPropsWithRef<"div"> {
  asChild?: boolean;
}

export function MenuGroup({
  children,
  className,
  asChild,
  ...props
}: MenuGroupProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn("flex w-full min-w-0 flex-col gap-y-0.5 p-2", className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

interface MenuItemProps extends React.ComponentPropsWithRef<"div"> {
  asChild?: boolean;
}

export function MenuItem({
  children,
  className,
  asChild,
  ...props
}: MenuItemProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(
        "flex min-h-7 flex-row items-center font-normal text-xs leading-7",
        "select-none outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

interface MenuLabelProps extends React.ComponentPropsWithRef<"div"> {
  asChild?: boolean;
}

export function MenuLabel({
  children,
  className,
  asChild,
  ...props
}: MenuLabelProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <MenuItem className="pl-0.5">
      <Comp
        className={cn(
          "flex h-5 w-fit min-w-0 items-center gap-x-1 rounded-md bg-transparent pr-1 pl-1.5 outline-none",
          "font-normal text-gray-10 text-xs leading-5",
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    </MenuItem>
  );
}

interface MenuActionProps extends React.ComponentPropsWithRef<"button"> {
  asChild?: boolean;
  isActive?: boolean;
}

export function MenuAction({
  children,
  className,
  asChild,
  isActive,
  ...props
}: MenuActionProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <MenuItem
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "group/menu w-fit cursor-pointer gap-x-2 rounded-md bg-transparent px-2 text-gray-11",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        "[&>span]:truncate [&>span]:font-[375] [&>span]:text-sm [&>span]:leading-5",
        "transition-colors duration-200 ease-in-out hover:bg-gray-4 hover:text-gray-12 focus-visible:bg-gray-4 focus-visible:text-gray-12",
        "data-[state=active]:bg-gray-4 data-[state=active]:text-gray-12",
        "disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-a11",
        className,
      )}
      asChild
    >
      <Comp {...props}>{children}</Comp>
    </MenuItem>
  );
}

interface CollapsibleMenuGroupProps
  extends React.ComponentProps<typeof Collapsible> {
  label: string;
}

export function CollapsibleMenuGroup({
  label,
  children,
  className,
  ...props
}: CollapsibleMenuGroupProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <MenuGroup className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} {...props}>
        <MenuLabel
          className={cn(
            "group",
            "cursor-pointer transition-colors duration-200 ease-in-out hover:bg-gray-5 hover:text-gray-12",
            "focus-visible:bg-gray-5 focus-visible:text-gray-12",
          )}
          asChild
        >
          <CollapsibleTrigger>
            <span className="truncate">{label}</span>
            <ChevronDownIcon className="group-data-[state=closed]:-rotate-90 size-4 text-gray-10 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-0" />
          </CollapsibleTrigger>
        </MenuLabel>
        <CollapsibleContent asChild>
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="content"
                className="flex flex-col gap-y-0.5"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.175, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </MenuGroup>
  );
}
