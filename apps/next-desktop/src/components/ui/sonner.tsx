"use client";

import { cn } from "@/lib/cn";
import { XIcon } from "lucide-react";
import { Toaster as Sonner, ToasterProps, toast as sonnerToast } from "sonner";
import { textVariants } from "../typography";

const Toaster = ({ ...props }: ToasterProps) => {
  return <Sonner className="w-full [&>li]:w-full" {...props} />;
};

interface ToastProps {
  id: string | number;
  title: string;
  description?: string;
}

export function toast(toast: Omit<ToastProps, "id">) {
  return sonnerToast.custom((id) => (
    <Toast id={id} title={toast.title} description={toast.description} />
  ));
}

function Toast(props: ToastProps) {
  const { title, description, id } = props;

  return (
    <div
      className={cn(
        "relative flex w-full grow items-center rounded-md",
        "bg-gray-12 text-gray-1 shadow-lg dark:shadow-none",
        "md:max-w-[364px]",
      )}
    >
      <button
        className="absolute top-2 right-2 flex size-6 cursor-pointer items-center justify-center rounded text-gray-1/50 outline-none transition-colors duration-200 ease-in-out hover:bg-gray-1/20 hover:text-gray-1"
        onClick={() => sonnerToast.dismiss(id)}
      >
        <span className="sr-only">Dismiss</span>
        <XIcon className="size-4" aria-hidden />
      </button>

      <div className="flex flex-1 items-center p-3">
        <div className="flex w-full flex-col gap-2">
          <p
            className={cn(
              textVariants({ variant: "p" }),
              "text-sm leading-none",
            )}
          >
            {title}
          </p>
          {description && (
            <p
              className={cn(
                textVariants({ variant: "p" }),
                "text-gray-8 text-sm",
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export { Toaster };
