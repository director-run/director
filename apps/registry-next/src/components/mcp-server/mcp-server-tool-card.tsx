import {
  ActionCard,
  ActionCardContent,
  ActionCardDescription,
  ActionCardTitle,
} from "@director.run/design/ui/action-card";
import {} from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

interface MCPServerToolCardProps
  extends Omit<ComponentProps<typeof ActionCard>, "asChild"> {
  name: string;
  description: string;
  href: string;
  server: string;
}

export function MCPServerToolCard({
  name,
  description,
  href,
  server,
  ...props
}: MCPServerToolCardProps) {
  return (
    <ActionCard asChild spacing="sm" {...props}>
      <Link href={href}>
        <ActionCardContent>
          <ActionCardTitle className="gap-x-0 text-[15px] leading-5">
            <span className="font-[450] text-content-primary">{name}</span>
          </ActionCardTitle>
          <ActionCardDescription>{description}</ActionCardDescription>
        </ActionCardContent>
      </Link>
    </ActionCard>
  );
}
