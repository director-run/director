"use client";

import { McpLogo } from "@/components/mcp-logo";
import { Container } from "@/components/ui/container";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState, EmptyStateTitle } from "@/components/ui/empty-state";
import { Markdown, SimpleMarkdown } from "@/components/ui/markdown";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import { toast } from "@/components/ui/toast";
import { useZodForm } from "@/hooks/use-zod-form";
import { cn } from "@/lib/cn";
import { trpc } from "@/trpc/client";
import type { RegistryEntry } from "@director.run/utilities/schema";
import {
  ArrowSquareOutIcon,
  BookOpenTextIcon,
  HardDriveIcon,
  SealCheckIcon,
  ToolboxIcon,
} from "@phosphor-icons/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ComponentProps } from "react";
import { z } from "zod";
import { McpDescriptionList } from "../mcp-servers/mcp-description-list";
import { RegistryParameters } from "../registry/registry-parameters";
import { RegistryTools } from "../registry/registry-tools";
import { Badge, BadgeGroup, BadgeIcon, BadgeLabel } from "../ui/badge";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { HiddenField } from "../ui/form/hidden-field";
import { InputField } from "../ui/form/input-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

function GetStartedInstallForm({
  mcp,
  proxyId,
  className,
}: {
  mcp: RegistryEntry;
  proxyId: string;
  className?: string;
}) {
  const parameters = (mcp.parameters ?? []).filter(
    (parameter, index, array) =>
      array.findIndex((p) => p.name === parameter.name) === index,
  );
  const schema = z.object({
    proxyId: z.string(),
    parameters: z.object(
      parameters.reduce(
        (acc, param) => {
          acc[param.name] = z.string().trim().min(1, "Required");
          return acc;
        },
        {} as Record<string, z.ZodType<string>>,
      ),
    ),
  });

  const form = useZodForm({
    schema,
    defaultValues: {
      proxyId: proxyId,
      parameters: parameters.reduce(
        (acc, param) => {
          acc[param.name] = "";
          return acc;
        },
        {} as Record<string, string>,
      ),
    },
  });

  const utils = trpc.useUtils();

  const transportMutation = trpc.registry.getTransportForEntry.useMutation();

  const installMutation = trpc.store.addServer.useMutation({
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
    onSuccess: (data) => {
      utils.store.getAll.invalidate();
      toast({
        title: "Proxy installed",
        description: "This proxy was successfully installed.",
      });
    },
  });

  const isDisabled = form.formState.isSubmitting || installMutation.isPending;

  return (
    <Form
      form={form}
      className={cn(
        "gap-y-0 overflow-hidden rounded-xl bg-accent-subtle shadow-[0_0_0_0.5px_rgba(55,50,46,0.2)]",
        className,
      )}
      onSubmit={async (values) => {
        const transport = await transportMutation.mutateAsync({
          entryName: mcp.name,
          parameters: values.parameters,
        });
        installMutation.mutate({
          proxyId: values.proxyId,
          server: {
            name: mcp.name,
            transport,
            source: {
              name: "registry",
              entryId: mcp.id,
              entryData: mcp,
            },
          },
        });
      }}
    >
      <HiddenField name="proxyId" />
      {parameters.length > 0 && (
        <div className="flex flex-col gap-y-4 p-4">
          {parameters.map((param) => (
            <InputField
              type={param.password ? "password" : "text"}
              key={param.name}
              name={`parameters.${param.name}`}
              label={param.name}
              helperLabel={!param.required ? "Optional" : undefined}
              description={<SimpleMarkdown>{param.description}</SimpleMarkdown>}
              autoCorrect="off"
              spellCheck={false}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-y-1 border-fg/7 border-t-[0.5px] bg-accent px-4 py-2.5">
        <Button type="submit" disabled={isDisabled} className="w-full">
          {installMutation.isPending ? "Installing..." : "Add to proxy"}
        </Button>
        <DialogClose asChild>
          <Button
            className="w-full bg-surface/50"
            variant="secondary"
            disabled={isDisabled}
          >
            Cancel
          </Button>
        </DialogClose>
      </div>
    </Form>
  );
}

interface GetStartedInstallServerDialogProps
  extends ComponentProps<typeof Dialog> {
  mcp: RegistryEntry;
  proxyId: string;
}

export function GetStartedInstallServerDialog({
  mcp,
  proxyId,
  children,
  ...props
}: GetStartedInstallServerDialogProps) {
  const entryQuery = trpc.registry.getEntryByName.useQuery(
    {
      name: mcp.name,
    },
    {
      enabled: props.open,
    },
  );

  return (
    <Dialog {...props}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="!max-w-none !inset-1 !translate-0 !w-auto flex flex-col py-10">
        <VisuallyHidden>
          <DialogTitle className="pt-4">Install {mcp.title}</DialogTitle>
          <DialogDescription>{mcp.description}</DialogDescription>
        </VisuallyHidden>
        <Container size="xl">
          <div className="flex flex-row gap-x-8">
            <div className="flex min-w-0 grow flex-col gap-y-12 md:gap-y-16">
              <Section className="gap-y-8">
                <McpLogo src={mcp.icon} className="size-9" />
                <SectionHeader>
                  <SectionTitle>{mcp.title}</SectionTitle>
                  <SectionDescription>{mcp.description}</SectionDescription>
                </SectionHeader>

                <BadgeGroup>
                  {mcp.isOfficial && (
                    <Badge variant="success">
                      <BadgeIcon>
                        <SealCheckIcon />
                      </BadgeIcon>
                      <BadgeLabel uppercase>Official</BadgeLabel>
                    </Badge>
                  )}

                  {mcp.homepage && (
                    <Badge
                      className="transition-opacity duration-200 hover:opacity-50"
                      asChild
                    >
                      <a
                        href={mcp.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <BadgeIcon>
                          <ArrowSquareOutIcon weight="bold" />
                        </BadgeIcon>
                        <BadgeLabel uppercase>Homepage</BadgeLabel>
                      </a>
                    </Badge>
                  )}
                </BadgeGroup>
              </Section>

              <Tabs defaultValue="readme">
                <TabsList>
                  <TabsTrigger value="readme">
                    <BookOpenTextIcon /> Readme
                  </TabsTrigger>
                  <TabsTrigger value="tools">
                    <ToolboxIcon /> Tools
                  </TabsTrigger>
                  <TabsTrigger value="transport">
                    <HardDriveIcon /> Transport
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="readme">
                  {entryQuery.data?.readme ? (
                    <Markdown className="!max-w-none rounded-xl border-[0.5px] bg-accent-subtle/20 p-6">
                      {entryQuery.data?.readme}
                    </Markdown>
                  ) : (
                    <EmptyState>
                      <EmptyStateTitle>No readme found</EmptyStateTitle>
                    </EmptyState>
                  )}
                </TabsContent>

                <TabsContent
                  value="tools"
                  className="rounded-xl border-[0.5px] bg-accent-subtle/20 p-6"
                >
                  <Section>
                    <SectionHeader>
                      <SectionTitle variant="h2" asChild>
                        <h3>Tools</h3>
                      </SectionTitle>
                    </SectionHeader>
                    <RegistryTools tools={mcp.tools ?? []} />
                  </Section>
                </TabsContent>

                <TabsContent
                  value="transport"
                  className="flex flex-col gap-y-10 rounded-xl border-[0.5px] bg-accent-subtle/20 p-6"
                >
                  <Section>
                    <SectionHeader>
                      <SectionTitle variant="h2" asChild>
                        <h3>Overview</h3>
                      </SectionTitle>
                    </SectionHeader>
                    <McpDescriptionList transport={mcp.transport} />
                  </Section>

                  <Section>
                    <SectionHeader>
                      <SectionTitle variant="h2" asChild>
                        <h3>Parameters</h3>
                      </SectionTitle>
                    </SectionHeader>
                    <RegistryParameters parameters={mcp.parameters ?? []} />
                  </Section>
                </TabsContent>
              </Tabs>
            </div>
            <div className="hidden w-xs shrink-0 flex-col md:flex">
              <div className="sticky top-0 flex flex-col gap-y-8">
                <Section>
                  <SectionHeader>
                    <SectionTitle variant="h3" asChild>
                      <h3>Add to proxy</h3>
                    </SectionTitle>
                  </SectionHeader>

                  <GetStartedInstallForm
                    mcp={entryQuery.data as RegistryEntry}
                    proxyId={proxyId}
                  />
                </Section>
              </div>
            </div>
          </div>
        </Container>
        <div className="-bottom-5 sticky inset-x-0 px-4 pt-4 md:hidden">
          <GetStartedInstallForm
            mcp={entryQuery.data as RegistryEntry}
            proxyId={proxyId}
            className="shadow-[0_3px_9px_0px_rgba(55,50,46,0.1),0_0_20px_2px_rgba(55,50,46,0.07),_0_0_0_0.5px_rgba(55,50,46,0.2)]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
