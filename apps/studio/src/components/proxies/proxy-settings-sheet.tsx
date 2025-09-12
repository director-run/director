import { ReactNode } from "react";

import { StoreGet } from "../types";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { ProxyForm, ProxyFormData } from "./proxy-form";

interface ProxySettingsSheetProps {
  children: ReactNode;
  proxy: StoreGet;
  onSubmit: (values: ProxyFormData) => Promise<void>;
  isSubmitting?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProxySettingsSheet({
  children,
  proxy,
  onSubmit,
  isSubmitting = false,
  open,
  onOpenChange,
}: ProxySettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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

          <ProxyForm
            defaultValues={{
              name: proxy.name,
              description: proxy.description ?? undefined,
            }}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          >
            <button type="submit" className="self-start">
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </ProxyForm>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
