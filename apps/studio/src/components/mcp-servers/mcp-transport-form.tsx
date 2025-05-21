import { useZodForm } from "@/hooks/use-zod-form";
import {} from "react-hook-form";
import { z } from "zod";
import { InputField } from "../form/input-field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { RadioGroupItem } from "../ui/radio-group";
import { RadioGroup } from "../ui/radio-group";

const mcpTransportSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("stdio"),
    command: z.string().trim().min(1, "Required"),
    args: z.array(z.string().trim().min(1, "Required")).optional(),
    env: z.array(z.string().trim().min(1, "Required")).optional(),
  }),
  z.object({
    type: z.literal("sse"),
    url: z.string().trim().min(1, "Required"),
  }),
]);

interface McpTransportFormProps {
  defaultValues?: Partial<z.infer<typeof mcpTransportSchema>>;
}

export function McpTransportForm({ defaultValues }: McpTransportFormProps) {
  const form = useZodForm({
    schema: mcpTransportSchema,
    defaultValues,
  });

  const isSse = form.watch("type") === "sse";

  return (
    <Form
      form={form}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="stdio" />
                  </FormControl>
                  <FormLabel className="font-normal">STDIO</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="sse" />
                  </FormControl>
                  <FormLabel className="font-normal">SSE</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isSse ? (
        <InputField label="URL" name="url" />
      ) : (
        <>
          <InputField label="Command" name="command" />
          <div className="space-y-2">
            <FormLabel>Arguments</FormLabel>
            {form.watch("args")?.map((_, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`args.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder={`Argument ${index + 1}`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <button
              type="button"
              onClick={() => {
                const currentArgs = form.getValues("args") || [];
                form.setValue("args", [...currentArgs, ""]);
              }}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              + Add Argument
            </button>
          </div>
        </>
      )}

      <pre>{JSON.stringify(form.getValues(), null, 2)}</pre>
    </Form>
  );
}
