import { cn } from "@director.run/design/lib/cn";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@director.run/design/ui/avatar";
import { MCPBrand } from "@director.run/design/ui/brands";
import Image from "next/image";
import { ComponentProps } from "react";

const inverseIcon = ["GitHub", "Context 7"];

interface MCPServerAvatarProps extends ComponentProps<typeof Avatar> {
  title: string;
  icon: string | null;
}

export function MCPServerAvatar({
  title,
  icon,
  className,
  ...props
}: MCPServerAvatarProps) {
  return (
    <Avatar
      className={cn(
        "size-10 rounded",
        inverseIcon.includes(title) && "dark:invert",
        icon?.includes("mcp.svg") && "dark:invert",
        className,
      )}
      {...props}
    >
      {icon && (
        <AvatarImage src={icon} asChild>
          <Image
            src={icon}
            width={40}
            height={40}
            alt={title}
            className="size-full"
            loading="lazy"
          />
        </AvatarImage>
      )}
      <AvatarFallback>
        <MCPBrand />
      </AvatarFallback>
    </Avatar>
  );
}
