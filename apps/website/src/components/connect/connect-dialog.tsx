import { parseAsStringLiteral, useQueryStates } from "nuqs";
import { ComponentProps } from "react";
import { Contents, ContentsItem, ContentsItemLabel } from "../ui/contents";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export function useConnectDialog() {
  const [{ dialog }, setQueryStates] = useQueryStates({
    dialog: parseAsStringLiteral(["connect"]),
  });

  return {
    open: dialog === "connect",
    onOpenChange: (open: boolean) =>
      setQueryStates({ dialog: open ? "connect" : null }),
  };
}

interface ConnectDialogProps extends ComponentProps<typeof Dialog> {
  children?: React.ReactNode;
}

export function ConnectDialog({ children, ...props }: ConnectDialogProps) {
  return (
    <Dialog {...props}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Not a fan of terminals?</DialogTitle>
          <DialogDescription>
            Director also comes with a friendly user interface that you can use
            to manage your MCP servers right here on director.run.
          </DialogDescription>
        </DialogHeader>

        <Contents list="numerical" variant="default">
          <ContentsItem>
            <ContentsItemLabel truncate={false}>
              Install and start our CLI (command-line interface).
            </ContentsItemLabel>
          </ContentsItem>
          <ContentsItem>
            <ContentsItemLabel truncate={false}>
              Visit director.run and click "manage" in the top right.
            </ContentsItemLabel>
          </ContentsItem>
          <ContentsItem>
            <ContentsItemLabel truncate={false}>
              Configure your servers and enjoy!
            </ContentsItemLabel>
          </ContentsItem>
        </Contents>
      </DialogContent>
    </Dialog>
  );
}
