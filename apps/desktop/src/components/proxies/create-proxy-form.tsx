"use client";

import { type Proxy, proxySchema } from "@director.run/store/schema";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useZodForm } from "@/hooks/use-zod-form";
import { trpc } from "@/lib/trpc/trpc";

export function CreateProxyForm() {
  const navigate = useNavigate();

  const form = useZodForm({
    schema: proxySchema.omit({ id: true }),
    defaultValues: {
      name: "",
      servers: [],
    },
  });

  const utils = trpc.useUtils();

  const createServerMutation = trpc.store.create.useMutation();

  async function onSubmit(data: Omit<Proxy, "id">) {
    const res = await createServerMutation.mutateAsync(data);

    toast({
      title: "Server created",
      description: `${res.name} has been created successfully.`,
    });

    await utils.store.getAll.refetch();
    await navigate("/");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="My first server" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
