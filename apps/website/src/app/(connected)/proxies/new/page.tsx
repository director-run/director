"use client";
import { Container } from "@/components/ui/container";
import {} from "@/components/ui/dropdown-menu";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import {} from "lucide-react";

export default function NewProxyPage() {
  return (
    <Container className="py-12">
      <div className="flex w-full flex-col gap-y-8">
        <Section>
          <SectionHeader>
            <SectionTitle>New proxy</SectionTitle>
            <SectionDescription>
              Create a new proxy to start using MCP.
            </SectionDescription>
          </SectionHeader>
        </Section>
      </div>
    </Container>
  );
}
