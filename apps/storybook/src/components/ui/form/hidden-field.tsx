import type { ComponentPropsWithoutRef } from "react";
import { useFormContext } from "react-hook-form";
import { FormField } from "../form";
import { Input } from "../input";
import type { CommonFieldProps } from "./types";

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
