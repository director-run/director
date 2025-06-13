"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import Image from "next/image";
import { ComponentProps } from "react";

import { cn } from "@/lib/cn";
import { REGISTRY_URL } from "@/lib/urls";

import McpImageSrc from "../../public/icons/mcp.svg";

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
        <Image src={McpImageSrc} alt="MCP Logo" className="size-full" />
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
