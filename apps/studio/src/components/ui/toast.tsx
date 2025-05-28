"use client";

import { XIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";
import { Button } from "./button";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: "w-full",
        },
      }}
      gap={8}
      expand
      {...props}
    />
  );
};

interface ToastProps {
  id: string | number;
  title: string;
  description: string;
}

function Toast(props: ToastProps) {
  const { id, title, description } = props;

  return (
    <div className="flex w-full items-start justify-between rounded-xl bg-fg p-3 text-surface">
      <div className="flex flex-col gap-y-1">
        <p className="font-medium text-sm leading-tight">{title}</p>
        <p className="text-surface/70 text-xs">{description}</p>
      </div>

      <Button
        size="icon"
        variant="inverse"
        className="-top-2 -right-2 relative size-6"
        onClick={() => {
          sonnerToast.dismiss(id);
        }}
      >
        <XIcon />
        <span className="sr-only">Close</span>
      </Button>
    </div>
  );
}

interface ToastOptions {
  dismissible?: boolean;
  duration?: number;
}

function toast(toast: Omit<ToastProps, "id">, options?: ToastOptions) {
  return sonnerToast.custom((id) => <Toast id={id} {...toast} />, options);
}

export { Toaster, toast };
