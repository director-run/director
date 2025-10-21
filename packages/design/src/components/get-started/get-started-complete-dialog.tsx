import {
  ArrowRightIcon,
  BookOpenIcon,
  HardDriveIcon,
  ListMagnifyingGlassIcon,
} from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import { cn } from "../../helpers/cn";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Label } from "../ui/label";

type GetStartedCompleteDialogProps = ComponentProps<typeof AlertDialog> & {
  onClickLibrary: () => void;
  onClickPlaybook: () => void;
};

export function GetStartedCompleteDialog(props: GetStartedCompleteDialogProps) {
  const { onClickLibrary, onClickPlaybook, ...alertDialogProps } = props;
  return (
    <AlertDialog {...alertDialogProps}>
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

          <NextStepsLink href="/library" onClick={onClickLibrary}>
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
            onClick={onClickPlaybook}
          >
            <HardDriveIcon weight="fill" />
            <span>Continue to your playbook</span>
          </NextStepsLink>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface NextStepsLinkProps {
  className?: string;
  children: React.ReactNode;
  href: string;
  onClick?: () => void;
}

function NextStepsLink({
  className,
  children,
  href,
  onClick,
}: NextStepsLinkProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = href;
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "group grid grid-cols-[24px_1fr_24px] items-center gap-2",
        "h-9 rounded-md bg-accent pr-1.5 pl-3 font-[450] text-[15px]",
        "outline-none hover:bg-accent-subtle",
        "[&>svg]:size-5",
        className,
      )}
      onClick={handleClick}
    >
      {children}
      <ArrowRightIcon
        weight="bold"
        className="opacity-0 transition-opacity duration-200 group-hover:opacity-60"
      />
    </button>
  );
}
