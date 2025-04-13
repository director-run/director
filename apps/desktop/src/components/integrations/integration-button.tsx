import {
  proxyQueryStatesSerializer,
  useProxyQueryStates,
} from "@/hooks/use-proxy-query-states";
import { cn } from "@/lib/cn";
import { type Integration } from "@director/backend/src/services/db/schema";
import { Check } from "@phosphor-icons/react";
import Link from "next/link";
import { Avatar } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { INTEGRATION_CONTENT } from "./contants";

interface IntegrationButtonProps
  extends Omit<React.ComponentProps<typeof Link>, "children" | "href"> {
  integrationId: Integration | "manual";
  isInstalled: boolean;
}

export function IntegrationButton({
  integrationId,
  isInstalled,
  className,
  ...props
}: IntegrationButtonProps) {
  const [proxyQueryStates] = useProxyQueryStates();
  const integration = INTEGRATION_CONTENT[integrationId];

  const label = isInstalled ? "Remove from" : "Add to";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          className={cn(
            "cursor-pointer transition-all duration-300 ease-in-out [&_img]:pointer-events-none",
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
          <Link
            href={`/proxy${proxyQueryStatesSerializer({ ...proxyQueryStates, integrationId })}`}
            {...props}
          >
            {isInstalled && (
              <span className="-translate-y-1/3 absolute top-0 right-0 z-10 grid size-5 translate-x-1/3 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
                <Check className="size-3" />
              </span>
            )}
            {integration.avatarContent}
          </Link>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>
        {label} {integration.name}
      </TooltipContent>
    </Tooltip>
  );
}
