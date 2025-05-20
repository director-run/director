import { cn } from "@/lib/cn";
import { ComponentProps } from "react";
import { Badge } from "../ui/badge";

interface InstallerCardProps extends ComponentProps<"button"> {
  title: string;
  description: string;
  installed: boolean;
}

export function InstallerCard({
  className,
  children,
  title,
  description,
  installed,
  ...props
}: InstallerCardProps) {
  return (
    <button
      type="button"
      className={cn(
        "group relative flex w-full cursor-pointer flex-col gap-6 overflow-hidden rounded-2xl bg-element p-4",
        className,
      )}
      {...props}
    >
      <Badge variant={installed ? "default" : "inverse"} className="self-start">
        {installed ? "Installed" : "Install"}
      </Badge>

      <div className="flex flex-col items-start gap-y-0.5">
        <h3 className="text-lg">{title}</h3>
        <p className="text-foreground-subtle text-sm">{description}</p>
      </div>

      <div className="absolute inset-0 grid place-items-center bg-foreground/5 opacity-0 backdrop-blur-sm transition-opacity duration-200 ease-in-out group-hover:opacity-100">
        <Badge variant="default">{installed ? "Uninstall" : "Install"}</Badge>
      </div>
    </button>
  );
}
