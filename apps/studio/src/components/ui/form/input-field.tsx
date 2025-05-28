import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ComponentPropsWithoutRef } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "../label";
import { CommonFieldProps } from "./types";

type InputFieldProps = CommonFieldProps &
  ComponentPropsWithoutRef<typeof Input>;

export function InputField({
  description,
  label,
  name,
  helperLabel,
  hideErrors = false,
  ...props
}: InputFieldProps) {
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
              <Input {...props} {...field} />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {!hideErrors && <FormMessage />}
          </div>
        </FormItem>
      )}
    />
  );
}
