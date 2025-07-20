import { Container } from "@director.run/design/components/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@director.run/design/components/section";
import {
  View,
  ViewHeader,
  ViewPanel,
  ViewPanelContent,
  ViewPanels,
} from "@director.run/design/components/view";
import {
  Badge,
  BadgeGroup,
  BadgeIcon,
  BadgeLabel,
} from "@director.run/design/ui/badge";
import { Button } from "@director.run/design/ui/button";
import { Card } from "@director.run/design/ui/card";
import { Markdown, SimpleMarkdown } from "@director.run/design/ui/markdown";
import {
  NonIdealState,
  NonIdealStateDescription,
  NonIdealStateTitle,
} from "@director.run/design/ui/non-ideal-state";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  GlobeIcon,
  LinkIcon,
  TerminalIcon,
} from "lucide-react";
import { notFound } from "next/navigation";

import { MCPServerInstallationDescription } from "components/mcp-server/mcp-installation-description";
import { MCPServerAvatar } from "components/mcp-server/mcp-server-avatar";
import { MCPServerNavigation } from "components/mcp-server/mcp-server-navigation";
import { MCPServerToolCard } from "components/mcp-server/mcp-server-tool-card";
import { Link } from "i18n/navigation";
import { trpc } from "../../../trpc/server";

interface ServerPageProps {
  params: Promise<{
    serverId: string;
  }>;
}

export default async function ServerPage({ params }: ServerPageProps) {
  const { serverId } = await params;

  const entry = await trpc.entries.getEntryByName({ name: serverId });

  if (!entry) {
    return notFound();
  }

  const tools = entry.tools ?? [];
  const hasTools = tools.length > 0;

  return (
    <View>
      <ViewHeader>
        <MCPServerNavigation server={entry} />
      </ViewHeader>

      <ViewPanels>
        <ViewPanel>
          <ViewPanelContent>
            <Container className="pt-16" size="lg">
              <Section>
                <SectionHeader>
                  <MCPServerAvatar title={entry.title} icon={entry.icon} />
                  <SectionTitle className="mt-4">{entry.title}</SectionTitle>
                  <SectionDescription>
                    <SimpleMarkdown>{entry.description}</SimpleMarkdown>
                  </SectionDescription>
                </SectionHeader>

                <BadgeGroup>
                  {entry.isOfficial && (
                    <Badge variant="blue">
                      <BadgeIcon>
                        <BadgeCheckIcon />
                      </BadgeIcon>
                      <BadgeLabel uppercase>Official</BadgeLabel>
                    </Badge>
                  )}
                  {entry.transport.type === "http" && (
                    <Badge variant="secondary">
                      <BadgeIcon>
                        <GlobeIcon />
                      </BadgeIcon>
                      <BadgeLabel uppercase>Remote</BadgeLabel>
                    </Badge>
                  )}
                  {entry.transport.type === "stdio" && (
                    <Badge className="text-content-primary" variant="secondary">
                      <BadgeIcon>
                        <TerminalIcon />
                      </BadgeIcon>
                      <BadgeLabel uppercase>STDIO</BadgeLabel>
                    </Badge>
                  )}

                  {entry.homepage && (
                    <Badge variant="tertiary" asChild>
                      <a
                        href={entry.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <BadgeIcon>
                          <LinkIcon />
                        </BadgeIcon>
                        <BadgeLabel uppercase>Homepage</BadgeLabel>
                      </a>
                    </Badge>
                  )}
                </BadgeGroup>
              </Section>

              <Section className="gap-y-4 sm:gap-y-6">
                <SectionHeader>
                  <SectionTitle className="flex flex-row items-center gap-x-2 text-xl sm:text-xl md:text-2xl">
                    <Link href={`/${entry.name}/installation`}>Transport</Link>
                  </SectionTitle>
                </SectionHeader>

                <MCPServerInstallationDescription server={entry} />

                <Button
                  asChild
                  size="sm"
                  className="mt-1.5 self-start"
                  variant="secondary"
                >
                  <Link href={`/${entry.name}/installation`}>
                    <span>View setup guide</span>
                    <ArrowRightIcon />
                  </Link>
                </Button>
              </Section>

              <Section className="gap-y-4 sm:gap-y-6">
                <SectionHeader>
                  <SectionTitle className="flex flex-row items-center gap-x-2 text-xl sm:text-xl md:text-2xl">
                    <Link href={`/${entry.name}/tools`}>
                      Tools{" "}
                      {hasTools && (
                        <span className="text-content-tertiary">
                          ({tools.length})
                        </span>
                      )}
                    </Link>
                  </SectionTitle>
                </SectionHeader>

                {hasTools ? (
                  <div className="flex flex-col gap-y-2">
                    {tools.slice(0, 3).map((tool) => (
                      <MCPServerToolCard
                        key={tool.name}
                        description={tool.description}
                        href={`/${entry.name}/tools/${tool.name}`}
                        name={tool.name}
                        server={entry.name}
                      />
                    ))}
                  </div>
                ) : (
                  <NonIdealState>
                    <NonIdealStateTitle>No tool information</NonIdealStateTitle>
                    <NonIdealStateDescription>
                      We don't have any tool information for this server. Once
                      this server is running, you'll be able to see the tools
                      available.
                    </NonIdealStateDescription>
                    <NonIdealStateDescription className="prose">
                      <SimpleMarkdown>
                        {`You can also try the [README.md](/${serverId}/readme).`}
                      </SimpleMarkdown>
                    </NonIdealStateDescription>
                  </NonIdealState>
                )}

                {hasTools && (
                  <Button
                    asChild
                    size="sm"
                    className="mt-1.5 self-start"
                    variant="secondary"
                  >
                    <Link href={`/${entry.name}/tools`}>
                      <span>View all {tools.length} tools</span>
                      <ArrowRightIcon />
                    </Link>
                  </Button>
                )}
              </Section>

              <Section className="gap-y-4 sm:gap-y-6">
                <SectionHeader>
                  <SectionTitle className="flex flex-row items-center gap-x-2 text-xl sm:text-xl md:text-2xl">
                    <Link href={`/${entry.name}/readme`}>README.md</Link>
                  </SectionTitle>
                </SectionHeader>

                {entry.readme ? (
                  <Card
                    spacing="sm"
                    className="pointer-events-none relative max-h-60 select-none overflow-hidden after:absolute after:inset-x-0 after:bottom-0 after:block after:h-64 after:bg-gradient-to-t after:from-surface after:to-transparent"
                  >
                    <Markdown className="prose-sm">
                      {entry.readme.split("\n").slice(0, 8).join("\n")}
                    </Markdown>
                  </Card>
                ) : (
                  <NonIdealState>
                    <NonIdealStateTitle>No README found</NonIdealStateTitle>
                    <NonIdealStateDescription className="prose">
                      <SimpleMarkdown>{`We don't have a README available for this server. However, you can try looking [here](${entry.homepage}).`}</SimpleMarkdown>
                    </NonIdealStateDescription>
                  </NonIdealState>
                )}

                {entry.readme && (
                  <Button
                    asChild
                    size="sm"
                    className="mt-1.5 self-start"
                    variant="secondary"
                  >
                    <Link href={`/${entry.name}/readme`}>
                      <span>Read more</span>
                      <ArrowRightIcon />
                    </Link>
                  </Button>
                )}
              </Section>
            </Container>
          </ViewPanelContent>
        </ViewPanel>
      </ViewPanels>
    </View>
  );
}
