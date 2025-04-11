import { cn } from "@/lib/cn";
import { type Integration } from "@director/backend/src/services/db/schema";
import { Check } from "@phosphor-icons/react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { INTEGRATION_CONTENT } from "./contants";

interface IntegrationButtonProps
  extends Omit<React.ComponentProps<"button">, "children"> {
  integrationId: Integration;
  isInstalled: boolean;
}

export function IntegrationButton({
  integrationId,
  isInstalled,
  className,
  ...props
}: IntegrationButtonProps) {
  const integration = INTEGRATION_CONTENT[integrationId];

  const label = isInstalled ? "Manage" : "Install";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          className={cn(
            "cursor-pointer transition-all duration-300 ease-in-out",
            {
              "opacity-80 saturate-0 hover:opacity-100 hover:saturate-100":
                !isInstalled && integrationId !== "cursor",
              "saturate-100": isInstalled && integrationId !== "cursor",
              "opacity-40 hover:opacity-100":
                !isInstalled && integrationId === "cursor",
              "opacity-100": isInstalled && integrationId === "cursor",
            },
          )}
          asChild
        >
          <button {...props}>
            {isInstalled && (
              <span className="-translate-y-1/3 absolute top-0 right-0 z-10 grid size-5 translate-x-1/3 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
                <Check className="size-3" />
              </span>
            )}
            <AvatarImage src={integration.icon} />
          </button>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>
        {label} {integration.name} integration
      </TooltipContent>
    </Tooltip>
  );
}
