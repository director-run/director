import type { StoreGet } from "../types";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { ProxyForm } from "./proxy-form";
import type { ProxyFormData } from "./proxy-form";

interface ProxySettingsSheetProps {
  proxy: StoreGet;
  onSubmit: (values: ProxyFormData) => Promise<void>;
  isSubmitting?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProxySettingsSheet({
  proxy,
  onSubmit,
  isSubmitting = false,
  open,
  onOpenChange,
}: ProxySettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
            <Button>Save changes</Button>
          </ProxyForm>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
