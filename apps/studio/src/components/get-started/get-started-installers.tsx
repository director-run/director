"use client";

import { CircleNotchIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { ComponentProps } from "react";

import { ListItemTitle } from "@/components/ui/list";
import { toast } from "@/components/ui/toast";
import { trpc } from "@/trpc/client";

import { cn } from "@/lib/cn";

import claudeIconImage from "../../../public/icons/claude-icon.png";
import cursorIconImage from "../../../public/icons/cursor-icon.png";

interface InstallButtonProps extends ComponentProps<"button"> {
  client: "claude" | "cursor";
  onClick: () => void;
}

function InstallButton({
  className,
  client,
  onClick,
  ...props
}: InstallButtonProps) {
  const imageSrc = client === "claude" ? claudeIconImage : cursorIconImage;

  return (
    <button
      className={cn(
        "relative flex flex-1 flex-col items-center gap-y-1 overflow-hidden rounded-lg bg-accent p-3",
        "cursor-pointer hover:bg-accent-subtle",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
      {...props}
    >
      <Image src={imageSrc} alt="Claude" width={64} height={64} />
      <ListItemTitle className="capitalize">{client}</ListItemTitle>
      <div
        className="absolute inset-0 hidden items-center justify-center bg-fg/50 data-[state=submitting]:flex"
        aria-hidden="true"
      >
        <CircleNotchIcon
          weight="bold"
          className="size-10 animate-spin text-surface"
        />
      </div>
    </button>
  );
}

interface GetStartedInstallersProps {
  proxyId: string;
}

export function GetStartedInstallers({ proxyId }: GetStartedInstallersProps) {
  const utils = trpc.useUtils();
  const mutation = trpc.installer.byProxy.install.useMutation({
    onSuccess: () => {
      utils.installer.byProxy.list.invalidate();
      toast({
        title: "Proxy installed",
        description: `This proxy was successfully installed`,
      });
    },
  });
  return (
    <div className="group flex flex-row items-center justify-center gap-x-1.5 p-4 md:transition-all md:duration-300 md:ease-in-out md:*:group-hover:opacity-20 md:*:group-focus-within:opacity-20 md:*:group-focus-within:focus-visible:opacity-100 md:*:hover:opacity-100">
      <InstallButton
        data-state={mutation.isPending ? "submitting" : "idle"}
        client="claude"
        onClick={() => {
          mutation.mutate({
            proxyId,
            client: "claude",
            baseUrl: "http://localhost:3673",
          });
        }}
        disabled={mutation.isPending}
      />
      <InstallButton
        data-state={mutation.isPending ? "submitting" : "idle"}
        client="cursor"
        onClick={() => {
          mutation.mutate({
            proxyId,
            client: "cursor",
            baseUrl: "http://localhost:3673",
          });
        }}
        disabled={mutation.isPending}
      />
    </div>
  );
}
