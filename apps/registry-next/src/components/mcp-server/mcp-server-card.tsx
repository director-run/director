import { Tooltip } from "@director.run/design/components/tooltip";
import {
  ActionCard,
  ActionCardContent,
  ActionCardDescription,
  ActionCardTitle,
} from "@director.run/design/ui/action-card";
import { BadgeCheckIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

import { MCPServerAvatar } from "./mcp-server-avatar";

interface MCPCardProps
  extends Omit<ComponentProps<typeof ActionCard>, "asChild"> {
  title: string;
  description?: string;
  href: string;
  icon: string | null;
  isOfficial?: boolean;
}

export function MCPCard({
  title,
  description,
  href,
  icon,
  isOfficial,
  ...props
}: MCPCardProps) {
  return (
    <ActionCard asChild {...props}>
      <Link href={href}>
        <MCPServerAvatar title={title} icon={icon} className="size-6" />

        <ActionCardContent>
          <ActionCardTitle>
            <span>{title}</span>
            {isOfficial && (
              <Tooltip value="Official MCP server">
                <BadgeCheckIcon className="size-4.5" />
              </Tooltip>
            )}
          </ActionCardTitle>
          {description && (
            <ActionCardDescription>{description}</ActionCardDescription>
          )}
        </ActionCardContent>
      </Link>
    </ActionCard>
  );
}
