"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { ComponentProps } from "react";
import { REGISTRY_URL } from "../config";
import { cn } from "../helpers/cn";
import { MCPIcon } from "./ui/icons/mcp-icon";

interface McpLogoProps
  extends Omit<ComponentProps<typeof AvatarPrimitive.Root>, "children"> {
  src?: string | null;
}

export function McpLogo({ src, className, ...props }: McpLogoProps) {
  const srcUrl = src?.startsWith("http") ? src : `${REGISTRY_URL}/${src}`;

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex size-8 shrink-0", className)}
      aria-hidden
      {...props}
    >
      <AvatarPrimitive.Image
        data-slot="avatar-image"
        className={cn("aspect-square size-full", className)}
        src={srcUrl ?? `${REGISTRY_URL}/public/mcp.svg`}
      />
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        className={cn(
          "flex size-full items-center justify-center rounded-full bg-fg/10 p-1.5",
          className,
        )}
      >
        <MCPIcon />
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
