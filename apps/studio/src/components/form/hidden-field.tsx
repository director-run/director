import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ComponentPropsWithoutRef } from "react";
import { useFormContext } from "react-hook-form";
import { CommonFieldProps } from "./types";

type InputFieldProps = CommonFieldProps &
  ComponentPropsWithoutRef<typeof Input>;

export function HiddenField({ name, ...props }: InputFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => <Input type="hidden" {...props} {...field} />}
    />
  );
}
