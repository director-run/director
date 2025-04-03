"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";

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
import { trpc } from "@/lib/trpc/trpc";

const ServerFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  servers: z.array(
    z.object({
      name: z.string(),
      transport: z.union([
        z.object({ command: z.string(), args: z.array(z.string()) }),
        z.object({ type: z.literal("sse"), url: z.string() }),
      ]),
    }),
  ),
});

export function ServerForm() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof ServerFormSchema>>({
    resolver: zodResolver(ServerFormSchema),
    defaultValues: {
      name: "",
      servers: [],
    },
  });

  const utils = trpc.useUtils();

  const createServerMutation = trpc.store.create.useMutation();

  async function onSubmit(data: z.infer<typeof ServerFormSchema>) {
    const res = await createServerMutation.mutateAsync(data);

    toast({
      title: "Server created",
      description: `${res.name} has been created successfully.`,
    });

    utils.store.getAll.invalidate();
    navigate("/");
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
