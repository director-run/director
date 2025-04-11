import { useFormContext } from "react-hook-form";

import { cn } from "@/lib/cn";
import { Conditional } from "./conditional";
import { Checkbox } from "./ui/checkbox";
import { FormDescription, FormField, FormItem } from "./ui/form";
import { FormControl, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface CommonFieldProps {
  name: string;
  label: string;
  description?: string;
  hideLabel?: boolean;
  hideErrors?: boolean;
}

export function InputField({
  name,
  label,
  description,
  hideLabel,
  hideErrors,
  ...props
}: React.ComponentProps<typeof Input> & CommonFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Conditional
            condition={!!description}
            wrap={(children) => (
              <div className={cn("flex flex-col gap-y-2")}>
                {children}
                {description && (
                  <FormDescription>{description}</FormDescription>
                )}
              </div>
            )}
          >
            <FormLabel hidden={hideLabel}>{label}</FormLabel>
          </Conditional>
          <FormControl>
            <Input {...field} {...props} />
          </FormControl>
          {!hideErrors && <FormMessage />}
        </FormItem>
      )}
    />
  );
}

export function TextareaField({
  name,
  label,
  description,
  hideLabel,
  hideErrors,
  onChange,
  ...props
}: React.ComponentProps<typeof Textarea> & CommonFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Conditional
            condition={!!description}
            wrap={(children) => (
              <div className={cn("flex flex-col gap-y-2")}>
                {children}
                {description && (
                  <FormDescription>{description}</FormDescription>
                )}
              </div>
            )}
          >
            <FormLabel hidden={hideLabel}>{label}</FormLabel>
          </Conditional>
          <FormControl>
            <Textarea
              {...field}
              {...props}
              onChange={(e) => {
                field.onChange(e.target.value);
                onChange?.(e);
              }}
              value={field.value ?? ""}
            />
          </FormControl>
          {!hideErrors && <FormMessage />}
        </FormItem>
      )}
    />
  );
}

interface CheckboxFieldProps
  extends Omit<React.ComponentProps<typeof Checkbox>, "name">,
    CommonFieldProps {
  value: string;
}

export function CheckboxField({
  name,
  label,
  description,
  hideLabel,
  hideErrors,
  value,
  onChange,
  ...props
}: CheckboxFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="relative flex flex-row items-start space-x-3 space-y-0 rounded-md border border-input p-4 shadow-xs">
          <FormControl>
            <Checkbox
              className="after:absolute after:inset-0"
              checked={field.value?.includes(value)}
              onCheckedChange={(checked) => {
                return checked
                  ? field.onChange([...field.value, value])
                  : field.onChange(
                      field.value?.filter((it: string) => it !== value),
                    );
              }}
              {...props}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
        </FormItem>
      )}
    />
  );
}
