"use client";
import { RegistryGetEntryTool } from "@/components/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { JSONSchema, type JsonSchema } from "@/components/ui/json-schema";
import { Markdown } from "@/components/ui/markdown";
import {
  Section,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import {
  Sheet,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
interface RegistryToolSheetProps {
  tool: RegistryGetEntryTool;
  mcpName: string;
  mcpId: string;
  onClose: () => void;
  onLibraryClick?: () => void;
  onMcpClick?: (mcpId: string) => void;
}

export function RegistryToolSheet({
  tool,
  mcpName,
  mcpId,
  onClose,
  onLibraryClick,
  onMcpClick,
}: RegistryToolSheetProps) {
  return (
    <Sheet open={!!tool} onOpenChange={onClose}>
      <SheetContent>
        <SheetActions>
          <Breadcrumb className="grow">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={onLibraryClick}
                  className="cursor-pointer"
                >
                  Library
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => onMcpClick?.(mcpId)}
                  className="cursor-pointer"
                >
                  {mcpName}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{tool.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </SheetActions>

        <SheetBody>
          <SheetHeader>
            <SheetTitle>{tool.name}</SheetTitle>
            <SheetDescription className="text-sm">
              From{" "}
              <button
                onClick={() => onMcpClick?.(mcpId)}
                className="cursor-pointer text-fg underline"
              >
                {mcpName}
              </button>
            </SheetDescription>
          </SheetHeader>

          <Markdown>{tool.description}</Markdown>

          <SectionSeparator />

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Input schema</h3>
              </SectionTitle>
            </SectionHeader>
            {tool.inputSchema ? (
              <JSONSchema schema={tool.inputSchema as JsonSchema} />
            ) : (
              <EmptyState>
                <EmptyStateTitle>No input schema</EmptyStateTitle>
                <EmptyStateDescription>
                  This tool does not require any parameters.
                </EmptyStateDescription>
              </EmptyState>
            )}
          </Section>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
