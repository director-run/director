"use client";

import {
  Sheet,
  SheetActions,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProxy } from "@/hooks/use-proxy";
import { ProxyAttributes } from "@director.run/gateway/db/schema";
import { TrashIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ProxyDeleteConfirmation } from "./proxy-delete-confirmation";
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
        <SheetActions>
          <ProxyDeleteConfirmation proxyId={proxyId}>
            <Button variant="default" size="icon">
              <TrashIcon />
              <span className="sr-only">Delete proxy</span>
            </Button>
          </ProxyDeleteConfirmation>

          <Badge className="mr-auto" variant="secondary">
            Proxy
          </Badge>
        </SheetActions>

        <SheetHeader className="pt-6">
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Update the name and description of the proxy.
          </SheetDescription>
        </SheetHeader>

        <div className="pt-8">
          <UpdateProxyForm
            {...(proxy as ProxyAttributes)}
            onSuccess={() => setIsOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
