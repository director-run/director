"use client";

import { useConnectContext } from "@/components/connect/connect-context";
import { McpServersTable } from "@/components/mcp-servers/mcp-servers-table";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import { ChevronDownIcon, Settings } from "lucide-react";
import { notFound } from "next/navigation";

export default function Manage() {
  const { selectedProxy } = useConnectContext();

  if (!selectedProxy) {
    return notFound();
  }

  return (
    <Container className="py-12">
      <div className="flex w-full flex-col gap-y-8">
        <Section>
          <SectionHeader>
            <SectionTitle>{selectedProxy.name}</SectionTitle>
            <SectionDescription
              className={
                selectedProxy.description ? "" : "text-foreground-faint"
              }
            >
              {selectedProxy.description ?? "No description"}
            </SectionDescription>
          </SectionHeader>

          <div className="flex flex-row gap-x-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="self-start">
                  <span>Connect</span>
                  <ChevronDownIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-96">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Connect any client</DropdownMenuLabel>
                  <input
                    type="text"
                    id="proxy-url"
                    className="block h-7 w-full border-none bg-background/10 px-2 text-foreground-inverse/80 outline-none"
                    value={`http://localhost:3000/${selectedProxy.id}/sse`}
                    readOnly
                  />
                  <DropdownMenuItem>Copy to clipboard</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>One-click install</DropdownMenuLabel>
                  <DropdownMenuItem>Claude Desktop</DropdownMenuItem>
                  <DropdownMenuItem>Cursor</DropdownMenuItem>
                  <DropdownMenuItem>Windsurf</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon">
              <Settings />
            </Button>
          </div>
        </Section>

        <SectionSeparator />

        <Section>
          <SectionHeader>
            <div className="flex flex-row justify-between">
              <SectionTitle className="leading-7" variant="h2" asChild>
                <h2>MCP servers</h2>
              </SectionTitle>
              <Button>Add</Button>
            </div>
          </SectionHeader>

          <McpServersTable
            servers={selectedProxy.servers}
            proxy={selectedProxy}
          />
        </Section>
      </div>
    </Container>
  );
}
