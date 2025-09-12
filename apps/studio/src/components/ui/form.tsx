"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import {
  Controller,
  type ControllerProps,
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  useFormContext,
} from "react-hook-form";

import type { z } from "zod";
import { cn } from "../../helpers/cn";
import type { UseZodFormReturn } from "../../hooks/use-zod-form";
import { useZodForm } from "../../hooks/use-zod-form";
import { Label } from "./label";

interface FormProps<T extends FieldValues> {
  form: UseZodFormReturn<T>;
  className?: string;
  children?: React.ReactNode;
  onSubmit: SubmitHandler<T>;
}

function Form<T extends FieldValues>({
  form,
  className,
  children,
  onSubmit,
}: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex w-full flex-col gap-y-8", className)}
      >
        {children}
      </form>
    </FormProvider>
  );
}

interface FormWithSchemaProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  defaultValues: DefaultValues<T>;
  className?: string;
  children?: React.ReactNode;
  onSubmit: SubmitHandler<T>;
}

function FormWithSchema<T extends FieldValues>({
  schema,
  defaultValues,
  className,
  children,
  onSubmit,
}: FormWithSchemaProps<T>) {
  const form = useZodForm({
    schema,
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex w-full flex-col gap-y-8", className)}
      >
        {children}
      </form>
    </FormProvider>
  );
}

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("flex flex-col gap-y-2", className)} {...rest} />
    </FormItemContext.Provider>
  );
}

function FormLabel(props: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { className, ...rest } = props;
  const { error, formItemId } = useFormField();

  return (
    <Label
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...rest}
    />
  );
}

function FormControl(props: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription(props: React.ComponentProps<"p">) {
  const { className, ...rest } = props;
  const { formDescriptionId } = useFormField();

  return (
    <p
      id={formDescriptionId}
      className={cn("text-fg-subtle text-xs", className)}
      {...rest}
    />
  );
}

function FormMessage(props: React.ComponentProps<"p">) {
  const { className, children, ...rest } = props;
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;

  if (!body) {
    return null;
  }

  return (
    <p
      id={formMessageId}
      className={cn("text-accent-red text-sm", className)}
      {...rest}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormWithSchema,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
