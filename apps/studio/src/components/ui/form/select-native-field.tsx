import type { ComponentPropsWithoutRef } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../../../helpers/cn";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";
import { Label } from "../label";
import { SelectNative } from "../select-native";
import type { CommonFieldProps } from "./types";

type SelectNativeFieldProps = CommonFieldProps &
  ComponentPropsWithoutRef<typeof SelectNative>;

export function SelectNativeField({
  className,
  description,
  label,
  name,
  helperLabel,
  hideErrors = false,
  ...props
}: SelectNativeFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex flex-col gap-1">
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
              <SelectNative
                className={cn("w-full", className)}
                {...props}
                {...field}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {!hideErrors && <FormMessage />}
          </div>
        </FormItem>
      )}
    />
  );
}
