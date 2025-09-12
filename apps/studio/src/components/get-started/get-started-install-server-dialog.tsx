import {
  ArrowSquareOutIcon,
  BookOpenTextIcon,
  HardDriveIcon,
  SealCheckIcon,
  ToolboxIcon,
} from "@phosphor-icons/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { cn } from "../../helpers/cn";
import { useZodForm } from "../../hooks/use-zod-form";
import { McpLogo } from "../mcp-logo";
import { McpDescriptionList } from "../mcp-servers/mcp-description-list";
import { RegistryParameters } from "../registry/registry-parameters";
import { RegistryTools } from "../registry/registry-tools";
import type { RegistryGetEntriesEntry, RegistryGetEntryByName } from "../types";
import { Badge, BadgeGroup, BadgeIcon, BadgeLabel } from "../ui/badge";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { EmptyState, EmptyStateTitle } from "../ui/empty-state";
import { Form } from "../ui/form";
import { HiddenField } from "../ui/form/hidden-field";
import { InputField } from "../ui/form/input-field";
import { Markdown, SimpleMarkdown } from "../ui/markdown";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../ui/section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

// Types for the presentational component
type GetStartedInstallFormProps = {
  mcp: RegistryGetEntriesEntry | RegistryGetEntryByName;
  proxyId: string;
  className?: string;
  onSubmit: SubmitHandler<{
    proxyId: string;
    parameters: Record<string, string>;
  }>;
  isSubmitting: boolean;
  isInstalling: boolean;
};

type GetStartedInstallServerDialogProps = {
  mcp: RegistryGetEntriesEntry;
  proxyId: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  entryData?: RegistryGetEntryByName | null;
  isLoading?: boolean;
  toolLinks: Array<{
    title: string;
    subtitle: string;
    scroll: boolean;
    href: string;
  }>;
};

// Presentational component - no state management or tRPC calls
function GetStartedInstallForm({
  mcp,
  proxyId,
  className,
  onSubmit,
  isSubmitting,
  isInstalling,
}: GetStartedInstallFormProps) {
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

  const isDisabled = isSubmitting || isInstalling;

  return (
    <Form
      form={form}
      className={cn(
        "gap-y-0 overflow-hidden rounded-xl bg-accent-subtle shadow-[0_0_0_0.5px_rgba(55,50,46,0.2)]",
        className,
      )}
      onSubmit={onSubmit}
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
          {isInstalling ? "Installing..." : "Add to proxy"}
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

// Presentational component - no state management or tRPC calls
function GetStartedInstallServerDialogPresentation({
  mcp,
  proxyId,
  children,
  open,
  onOpenChange,
  entryData,
  isLoading,
  onFormSubmit,
  isFormSubmitting,
  isFormInstalling,
  toolLinks,
}: GetStartedInstallServerDialogProps & {
  onFormSubmit: SubmitHandler<{
    proxyId: string;
    parameters: Record<string, string>;
  }>;
  isFormSubmitting: boolean;
  isFormInstalling: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  {entryData?.readme ? (
                    <Markdown className="!max-w-none rounded-xl border-[0.5px] bg-accent-subtle/20 p-6">
                      {entryData.readme}
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
                    <RegistryTools links={toolLinks} />
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
                    mcp={entryData || mcp}
                    proxyId={proxyId}
                    onSubmit={onFormSubmit}
                    isSubmitting={isFormSubmitting}
                    isInstalling={isFormInstalling}
                  />
                </Section>
              </div>
            </div>
          </div>
        </Container>
        <div className="-bottom-5 sticky inset-x-0 px-4 pt-4 md:hidden">
          <GetStartedInstallForm
            mcp={entryData || mcp}
            proxyId={proxyId}
            onSubmit={onFormSubmit}
            isSubmitting={isFormSubmitting}
            isInstalling={isFormInstalling}
            className="shadow-[0_3px_9px_0px_rgba(55,50,46,0.1),0_0_20px_2px_rgba(55,50,46,0.07),_0_0_0_0.5px_rgba(55,50,46,0.2)]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main dialog component - presentational only
export function GetStartedInstallServerDialog({
  mcp,
  proxyId,
  children,
  open,
  onOpenChange,
  entryData,
  isLoading,
  onFormSubmit,
  isFormSubmitting,
  isFormInstalling,
  toolLinks,
}: GetStartedInstallServerDialogProps & {
  onFormSubmit: SubmitHandler<{
    proxyId: string;
    parameters: Record<string, string>;
  }>;
  isFormSubmitting: boolean;
  isFormInstalling: boolean;
}) {
  return (
    <GetStartedInstallServerDialogPresentation
      mcp={mcp}
      proxyId={proxyId}
      children={children}
      open={open}
      onOpenChange={onOpenChange}
      entryData={entryData}
      isLoading={isLoading}
      onFormSubmit={onFormSubmit}
      isFormSubmitting={isFormSubmitting}
      isFormInstalling={isFormInstalling}
      toolLinks={toolLinks}
    />
  );
}
