"use client";
import { ReactNode, useState } from "react";

import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProxy } from "@/hooks/use-proxy";
import type { ProxyServerAttributes } from "@director.run/utilities/schema";
import { UpdateProxyForm } from "./proxy-form";

interface ProxySettingsSheetProps {
  proxyId: string;
  children: ReactNode;
}

export function ProxySettingsSheet({
  proxyId,
  children,
}: ProxySettingsSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { proxy } = useProxy(proxyId);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent>
        <SheetActions />
        <SheetBody>
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>
              Update the name and description of the proxy.
            </SheetDescription>
          </SheetHeader>

          <Separator />

          <UpdateProxyForm
            {...(proxy as ProxyServerAttributes)}
            onSuccess={() => setIsOpen(false)}
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
