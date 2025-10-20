import { DotsThreeOutlineVerticalIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { LayoutView, LayoutViewContent } from "../layout/layout";
import { LayoutBreadcrumbHeader } from "../layout/layout-breadcrumb-header";
import { ListSkeleton } from "../loaders/list-skeleton";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { ScrambleText } from "../ui/scramble-text";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../ui/section";

export function PlaybookSkeleton({ children }: { children?: ReactNode }) {
  return (
    <LayoutView className="pointer-events-none relative select-none">
      {children}
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: "Loading playbook…",
          },
        ]}
        loading={true}
      >
        <Button
          size="icon"
          variant="ghost"
          className="radix-state-[open]:bg-accent-subtle"
          disabled
        >
          <DotsThreeOutlineVerticalIcon weight="fill" className="!size-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </LayoutBreadcrumbHeader>
      <LayoutViewContent aria-hidden>
        <Container size="lg">
          <Section>
            <SectionHeader className="opacity-50">
              <SectionTitle>
                <ScrambleText text="Loading playbook name" />
              </SectionTitle>
              <SectionDescription>
                <ScrambleText text="Loading playbook description" />
              </SectionDescription>
            </SectionHeader>
          </Section>

          <Section>
            <SectionHeader className="opacity-50">
              <SectionTitle variant="h2" asChild>
                <h2>Usage</h2>
              </SectionTitle>
            </SectionHeader>
            {/* TODO LOADING STATE */}
          </Section>

          <Section>
            <SectionHeader className="flex flex-row items-center justify-between opacity-50">
              <SectionTitle variant="h2" asChild>
                <h2>MCP Servers</h2>
              </SectionTitle>
              <Button disabled>Add</Button>
            </SectionHeader>
            <ListSkeleton />
          </Section>

          <Section>
            <SectionHeader className="opacity-50">
              <SectionTitle variant="h2" asChild>
                <h2>Tools</h2>
              </SectionTitle>
            </SectionHeader>
            <ListSkeleton />
          </Section>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}
