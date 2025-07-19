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
import { notFound } from "next/navigation";

import { MCPServerInstallationDescription } from "components/mcp-server/mcp-installation-description";
import { MCPServerNavigation } from "../../../../components/mcp-server/mcp-server-navigation";
import { trpc } from "../../../../trpc/server";

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
                  <SectionTitle>Installation</SectionTitle>
                  <SectionDescription>
                    All the information you need to start using this MCP server.
                  </SectionDescription>
                </SectionHeader>
              </Section>

              <Section className="gap-y-4 sm:gap-y-6">
                <SectionHeader>
                  <SectionTitle className="text-xl sm:text-xl md:text-2xl">
                    Transport
                  </SectionTitle>
                </SectionHeader>

                <MCPServerInstallationDescription server={entry} />
              </Section>
            </Container>
          </ViewPanelContent>
        </ViewPanel>
      </ViewPanels>
    </View>
  );
}
