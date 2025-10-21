import { LinkIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { LayoutView, LayoutViewContent } from "../layout/layout";
import { LayoutBreadcrumbHeader } from "../layout/layout-breadcrumb-header";
import { ListSkeleton } from "../loaders/list-skeleton";
import { Badge, BadgeIcon, BadgeLabel } from "../ui/badge";
import { BadgeGroup } from "../ui/badge";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { ScrambleText } from "../ui/scramble-text";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "../ui/section";

export function RegistryEntrySkeleton({ children }: { children?: ReactNode }) {
  return (
    <LayoutView className="pointer-events-none relative select-none">
      {children}
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: "Library",
          },
          {
            title: "Loading",
          },
        ]}
        loading={true}
      >
        <Button disabled className="ml-auto">
          Add to playbook
        </Button>
      </LayoutBreadcrumbHeader>

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
            <ListSkeleton />
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader className="opacity-50">
              <SectionTitle variant="h2" asChild>
                <h3>Parameters</h3>
              </SectionTitle>
            </SectionHeader>
            <ListSkeleton />
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader className="opacity-50">
              <SectionTitle variant="h2" asChild>
                <h3>Tools</h3>
              </SectionTitle>
            </SectionHeader>
            <ListSkeleton />
          </Section>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}
