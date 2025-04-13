"use client";

import { InputField } from "@/components/fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useZodForm } from "@/hooks/use-zod-form";
import {
  McpServer,
  mcpServerSchema,
} from "@director/backend/src/services/db/schema";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface McpFormProps {
  buttonLabel?: string;
  defaultValues?: Partial<McpServer>;
  onSubmit: (data: McpServer) => void;
}

export function McpForm({
  buttonLabel,
  onSubmit,
  defaultValues,
}: McpFormProps) {
  const form = useZodForm({
    schema: mcpServerSchema,
    defaultValues: {
      name: defaultValues?.name ?? "",
      transport: defaultValues?.transport ?? {
        type: "stdio",
        command: "",
        args: [],
        env: [],
      },
    },
  });

  const type = form.watch("transport.type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        <Tabs
          className="gap-y-6"
          defaultValue={type}
          onValueChange={(value) => {
            form.resetField("transport");

            if (value === "stdio") {
              form.setValue("transport", {
                type: "stdio",
                command: "",
                args: [],
                env: [],
              });
            }

            if (value === "sse") {
              form.setValue("transport", {
                type: "sse",
                url: "",
              });
            }
          }}
        >
          <div className="flex flex-col gap-y-2">
            <Label asChild>
              <span>Transport</span>
            </Label>
            <TabsList>
              <TabsTrigger value="stdio">STDIO</TabsTrigger>
              <TabsTrigger value="sse">SSE</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="stdio">
            <div className="flex flex-col items-stretch gap-y-6">
              <InputField name="name" label="Name" placeholder="Fetch MCP" />
              <InputField
                name="transport.command"
                label="Command"
                placeholder="uvx"
              />
              <InputField
                name="transport.args.0"
                label="Args"
                placeholder="mcp-fetch-server"
              />
              <InputField name="transport.env" label="Env" />
            </div>
          </TabsContent>
          <TabsContent value="sse">
            <div className="flex flex-col items-stretch gap-y-6">
              <InputField name="name" label="Name" />
              <InputField
                name="transport.url"
                label="URL"
                placeholder="https://example.com"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Button className="w-full" size="lg" type="submit">
          {buttonLabel ?? "Add MCP server"}
        </Button>
      </form>
    </Form>
  );
}
