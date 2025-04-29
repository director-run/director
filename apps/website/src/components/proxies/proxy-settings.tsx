"use client";

import { ProxyAttributes } from "@director.run/db/schema";
import { ComponentProps, ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { UpdateProxyForm } from "./proxy-form";

interface ProxySettingsProps extends ComponentProps<typeof Dialog> {
  children?: ReactNode;
  proxy: ProxyAttributes;
}
export function ProxySettings({
  children,
  proxy,
  ...props
}: ProxySettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog {...props} open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <UpdateProxyForm {...proxy} onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
