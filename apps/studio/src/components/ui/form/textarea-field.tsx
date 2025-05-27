import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { ComponentPropsWithoutRef } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "../label";
import { Textarea } from "../textarea";
import { CommonFieldProps } from "./types";

type TextareaFieldProps = CommonFieldProps &
  ComponentPropsWithoutRef<typeof Textarea>;

export function TextareaField({
  description,
  label,
  name,
  helperLabel,
  hideErrors = false,
  ...props
}: TextareaFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex flex-col gap-2">
            {(label || helperLabel) && (
              <div className="flex flex-row items-center">
                {label && <FormLabel>{label}</FormLabel>}
                {helperLabel && (
                  <Label className="ml-auto text-fg-subtle/70">
                    {helperLabel}
                  </Label>
                )}
              </div>
            )}
            <FormControl>
              <Textarea {...props} {...field} />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {!hideErrors && <FormMessage />}
          </div>
        </FormItem>
      )}
    />
  );
}
