import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@director.run/design/components/ui/alert-dialog.tsx";
import { Button } from "@director.run/design/components/ui/button.tsx";
import { ConfirmDialog } from "@director.run/design/components/ui/confirm-dialog.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@director.run/design/components/ui/dialog.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@director.run/design/components/ui/dropdown-menu.tsx";
import {
  MenuItemIcon,
  MenuItemLabel,
} from "@director.run/design/components/ui/menu.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@director.run/design/components/ui/popover.tsx";
import {
  Sheet,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@director.run/design/components/ui/sheet.tsx";
import { Toaster, toast } from "@director.run/design/components/ui/toast.tsx";
import { GearIcon, SignOutIcon, TrashIcon } from "@phosphor-icons/react";
import { GalleryRow, GallerySection } from "./gallery-section";

export function OverlaysGallery() {
  return (
    <div className="flex flex-col gap-y-12">
      <GallerySection
        title="Dialogs & sheets"
        description="Click a trigger to open each overlay."
      >
        <GalleryRow label="triggers">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog title</DialogTitle>
                <DialogDescription>
                  A modal dialog with a header, body and footer.
                </DialogDescription>
              </DialogHeader>
              <p className="text-fg-subtle text-sm">Body content goes here.</p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Confirm</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="secondary">Open alert dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button>Continue</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <ConfirmDialog
            title="Delete item?"
            description="This action cannot be undone."
            onConfirm={() =>
              toast({ title: "Deleted", description: "The item was deleted." })
            }
          >
            <Button variant="secondary">Confirm dialog</Button>
          </ConfirmDialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button>Open sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetActions />
              <SheetBody>
                <SheetHeader>
                  <SheetTitle>Sheet title</SheetTitle>
                  <SheetDescription>
                    A side sheet for forms and detail views.
                  </SheetDescription>
                </SheetHeader>
                <p className="text-fg-subtle text-sm">Body content.</p>
              </SheetBody>
            </SheetContent>
          </Sheet>
        </GalleryRow>
      </GallerySection>

      <GallerySection title="Menus & popovers">
        <GalleryRow label="triggers">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">Open popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <p className="text-fg-subtle text-sm">
                Popover content anchored to its trigger.
              </p>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <MenuItemIcon>
                    <GearIcon />
                  </MenuItemIcon>
                  <MenuItemLabel>Settings</MenuItemLabel>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MenuItemIcon>
                    <SignOutIcon />
                  </MenuItemIcon>
                  <MenuItemLabel>Log out</MenuItemLabel>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <MenuItemIcon>
                    <TrashIcon />
                  </MenuItemIcon>
                  <MenuItemLabel>Delete</MenuItemLabel>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </GalleryRow>
      </GallerySection>

      <GallerySection
        title="Toasts"
        description="Transient notifications rendered by the Toaster."
      >
        <GalleryRow label="triggers">
          <Button
            onClick={() =>
              toast({
                title: "Saved",
                description: "Your changes were saved.",
              })
            }
          >
            Success
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "Heads up",
                description: "Something needs your attention.",
              })
            }
          >
            Info
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "Copied to clipboard",
                description:
                  "A longer description that wraps onto multiple lines to show how the toast grows with its content.",
              })
            }
          >
            Long
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              toast({ title: "Done", description: "Short and sweet." })
            }
          >
            Short
          </Button>
        </GalleryRow>
      </GallerySection>

      <Toaster />
    </div>
  );
}
