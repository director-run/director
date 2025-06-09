import { cn } from "@/lib/cn";
import { REGISTRY_URL } from "@/lib/urls";
import Image from "next/image";
import { ComponentProps } from "react";

interface McpLogoProps extends Omit<ComponentProps<"div">, "children"> {
  icon?: string | null;
}

export function McpLogo({ icon, className, ...props }: McpLogoProps) {
  const iconUrl = icon?.startsWith("http") ? icon : `${REGISTRY_URL}/${icon}`;

  return (
    <div
      className={cn("relative size-6 shrink-0", className)}
      aria-hidden
      {...props}
    >
      <Image
        src={iconUrl ?? `${REGISTRY_URL}/public/mcp.svg`}
        alt="MCP Logo"
        fill
        className="object-contain"
      />
    </div>
  );
}
