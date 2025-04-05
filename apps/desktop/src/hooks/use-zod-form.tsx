import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import type { FieldValues, UseFormProps, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { z } from "zod";

export type UseZodFormReturn<TFormValues extends FieldValues> =
  UseFormReturn<TFormValues> & {
    uniqueId: string;
  };

/**
 * Helper function to create a `react-hook-form` with a Zod schema.
 * Automatically infers the shape of the Zod schema and adds a validator.
 */
export function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
    schema: TSchema;
  },
): UseZodFormReturn<TSchema["_input"]> {
  const form = useForm<TSchema["_input"]>({
    ...props,
    resolver: zodResolver(props.schema, undefined, {
      // This makes it so we can use `.transform()`s on the schema without same transform getting applied again when it reaches the server
      raw: true,
    }),
  }) as UseZodFormReturn<TSchema["_input"]>;

  form.uniqueId = useId();

  return form;
}

// biome-ignore lint/suspicious/noExplicitAny: ok
export type AnyUseZodFormReturn = UseZodFormReturn<any>;
