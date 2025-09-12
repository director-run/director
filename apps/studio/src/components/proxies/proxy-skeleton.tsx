"use client";

import { DotsThreeOutlineVerticalIcon } from "@phosphor-icons/react";
import { ReactNode } from "react";
import { LayoutView, LayoutViewContent } from "../layout/layout";
import { LayoutNavigation } from "../layout/navigation";
import { ListOfLinks } from "../list-of-links";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { ScrambleText } from "../ui/scramble-text";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../ui/section";

export function ProxySkeleton({ children }: { children?: ReactNode }) {
  return (
    <LayoutView className="pointer-events-none relative select-none">
      {children}
      <LayoutNavigation aria-hidden>
        <Breadcrumb className="grow">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="opacity-50">
                <ScrambleText text="Loading proxy…" />
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button
          size="icon"
          variant="ghost"
          className="radix-state-[open]:bg-accent-subtle"
          disabled
        >
          <DotsThreeOutlineVerticalIcon weight="fill" className="!size-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </LayoutNavigation>
      <LayoutViewContent aria-hidden>
        <Container size="lg">
          <Section>
            <SectionHeader className="opacity-50">
              <SectionTitle>
                <ScrambleText text="Loading proxy name" />
              </SectionTitle>
              <SectionDescription>
                <ScrambleText text="Loading proxy description" />
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
            <ListOfLinks isLoading={true} links={[]} />
          </Section>

          <Section>
            <SectionHeader className="opacity-50">
              <SectionTitle variant="h2" asChild>
                <h2>Tools</h2>
              </SectionTitle>
            </SectionHeader>
            <ListOfLinks isLoading={true} links={[]} />
          </Section>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}
