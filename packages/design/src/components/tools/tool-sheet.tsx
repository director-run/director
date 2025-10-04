"use client";
import type { MCPTool } from "../types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "../ui/empty-state";
import { JSONSchema, type JsonSchema } from "../ui/json-schema";
import { Markdown } from "../ui/markdown";
import {
  Section,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "../ui/section";
import {
  Sheet,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

export function ToolSheet({ tool, mcpName, onClose }: ToolSheetProps) {
  return (
    <Sheet open={!!tool} onOpenChange={onClose}>
      <SheetContent>
        <SheetActions>
          <Breadcrumb className="grow">
            <BreadcrumbList>
              <BreadcrumbItem>{mcpName}</BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>{tool.name}</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </SheetActions>

        <SheetBody>
          <SheetHeader>
            <SheetTitle>{tool.name}</SheetTitle>
            <SheetDescription className="text-sm">
              From{" "}
              <button className="cursor-pointer text-fg underline">
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

interface ToolSheetProps {
  tool: MCPTool;
  mcpName: string;
  onClose: () => void;
}
