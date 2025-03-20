import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";

import { cn } from "@/lib/cn";

export const Ornament = ({ className, ...props }: React.ComponentPropsWithRef<typeof AvatarPrimitive.Root>) => <AvatarPrimitive.Root className={cn("relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-a12 text-gray-1", "[&>svg]:size-4", className)} {...props} />;

export const OrnamentImage = ({ className, ...props }: React.ComponentPropsWithRef<typeof AvatarPrimitive.Image>) => <AvatarPrimitive.Image className={cn("aspect-square h-full w-full", className)} {...props} />;

export const OrnamentFallback = ({ className, ...props }: React.ComponentPropsWithRef<typeof AvatarPrimitive.Fallback>) => <AvatarPrimitive.Fallback className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", "[&>svg]:size-4", className)} {...props} />;
