import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/cn";
import {
  ArrowRightIcon,
  BookOpenIcon,
  HardDriveIcon,
  ListMagnifyingGlassIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { ComponentProps } from "react";
import { Label } from "../ui/label";

function NextStepsLink({
  className,
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "group grid grid-cols-[24px_1fr_24px] items-center gap-2",
        "h-9 rounded-md bg-accent pr-1.5 pl-3 font-[450] text-[15px]",
        "outline-none hover:bg-accent-subtle",
        "[&>svg]:size-5",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowRightIcon
        weight="bold"
        className="opacity-0 transition-opacity duration-200 group-hover:opacity-60"
      />
    </Link>
  );
}

export function GetStartedCompleteDialog(
  props: ComponentProps<typeof AlertDialog>,
) {
  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader className="gap-y-0.5">
          <AlertDialogTitle className="text-xl">
            You&apos;re all set!
          </AlertDialogTitle>
          <AlertDialogDescription>
            Why not try calling your new MCP server from the installed client?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-1 border-accent border-t-[0.5px] p-5">
          <Label className="pb-1">Next steps</Label>

          <NextStepsLink href="/library">
            <ListMagnifyingGlassIcon className="text-fg-subtle" weight="fill" />
            <span>Discover more MCP servers</span>
          </NextStepsLink>
          <NextStepsLink href="https://docs.director.run">
            <BookOpenIcon className="text-fg-subtle" weight="fill" />
            <span>Explore our documentation</span>
          </NextStepsLink>
          <NextStepsLink
            className="bg-fg text-surface hover:bg-fg-subtle"
            href="/"
          >
            <HardDriveIcon weight="fill" />
            <span>Continue to your proxy</span>
          </NextStepsLink>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
