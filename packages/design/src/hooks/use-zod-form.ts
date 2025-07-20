import { zodResolver } from "@hookform/resolvers/zod";

import {
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
  useForm,
} from "react-hook-form";
import type { z } from "zod";

export type UseZodFormReturn<TFormValues extends FieldValues> =
  UseFormReturn<TFormValues>;

export function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
    schema: TSchema;
  },
): UseZodFormReturn<TSchema["_input"]> {
  return useForm<TSchema["_input"]>({
    ...props,

    // biome-ignore lint/suspicious/noExplicitAny: OK
    resolver: zodResolver(props.schema as any, undefined),
  }) as UseZodFormReturn<TSchema["_input"]>;
}

// biome-ignore lint/suspicious/noExplicitAny: OK
export type AnyUseZodFormReturn = UseZodFormReturn<any>;
