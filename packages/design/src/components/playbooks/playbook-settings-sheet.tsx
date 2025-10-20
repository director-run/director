import type { PlaybookDetail } from "../types";
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
import { PlaybookForm } from "./playbook-form";
import type { PlaybookFormData } from "./playbook-form";

interface PlaybookSettingsSheetProps {
  playbook: PlaybookDetail;
  onSubmit: (values: PlaybookFormData) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PlaybookSettingsSheet({
  playbook,
  onSubmit,
  open,
  onOpenChange,
}: PlaybookSettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetActions />
        <SheetBody>
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>
              Update the name and description of the playbook.
            </SheetDescription>
          </SheetHeader>

          <Separator />

          <PlaybookForm
            defaultValues={{
              name: playbook.name,
              description: playbook.description ?? undefined,
            }}
            onSubmit={onSubmit}
          >
            <Button>Save changes</Button>
          </PlaybookForm>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
