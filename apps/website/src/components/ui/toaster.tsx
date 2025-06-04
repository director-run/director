"use client";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";

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
  const { title, description } = props;

  return (
    <div className="flex w-full items-start justify-between rounded-xl bg-fg p-3 text-surface">
      <div className="flex flex-col gap-y-1">
        <p className="font-medium text-sm leading-tight">{title}</p>
        <p className="text-surface/70 text-xs">{description}</p>
      </div>
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
