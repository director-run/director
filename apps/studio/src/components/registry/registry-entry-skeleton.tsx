"use client";

import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "@/components/layout";
import { ListOfLinks } from "@/components/list-of-links";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ScrambleText } from "@/components/ui/scramble-text";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import { LinkIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { ReactNode } from "react";
import { Badge, BadgeIcon, BadgeLabel } from "../ui/badge";
import { BadgeGroup } from "../ui/badge";

export function RegistryEntrySkeleton({ children }: { children?: ReactNode }) {
  return (
    <LayoutView className="pointer-events-none relative select-none">
      {children}
      <LayoutViewHeader aria-hidden>
        <Breadcrumb className="grow">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="opacity-50">Library</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="opacity-50">
                <ScrambleText text="Loading" />
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button disabled className="ml-auto">
          Add to proxy
        </Button>
      </LayoutViewHeader>

      <LayoutViewContent aria-hidden>
        <Container size="lg">
          <Section className="gap-y-6">
            <SectionHeader className="opacity-50">
              <SectionTitle>
                <ScrambleText text="Title" />
              </SectionTitle>
              <SectionDescription>
                <ScrambleText text="Description" />
              </SectionDescription>
            </SectionHeader>

            <BadgeGroup>
              <Badge className="opacity-50">
                <BadgeIcon>
                  <SpinnerGapIcon weight="bold" />
                </BadgeIcon>
                <BadgeLabel uppercase>
                  <ScrambleText text="Badge" />
                </BadgeLabel>
              </Badge>

              <Badge className="ml-auto opacity-50">
                <BadgeIcon>
                  <LinkIcon weight="bold" />
                </BadgeIcon>
                <BadgeLabel uppercase>Homepage</BadgeLabel>
              </Badge>
            </BadgeGroup>
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader className="opacity-50">
              <SectionTitle variant="h2" asChild>
                <h3>Transport</h3>
              </SectionTitle>
            </SectionHeader>
            <ListOfLinks isLoading={true} links={[]} />
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader className="opacity-50">
              <SectionTitle variant="h2" asChild>
                <h3>Parameters</h3>
              </SectionTitle>
            </SectionHeader>
            <ListOfLinks isLoading={true} links={[]} />
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader className="opacity-50">
              <SectionTitle variant="h2" asChild>
                <h3>Tools</h3>
              </SectionTitle>
            </SectionHeader>
            <ListOfLinks isLoading={true} links={[]} />
          </Section>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}
