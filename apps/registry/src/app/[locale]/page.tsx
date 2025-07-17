import { Container } from "@director.run/design/components/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@director.run/design/components/section";
import {
  View,
  ViewPanel,
  ViewPanelContent,
  ViewPanels,
} from "@director.run/design/components/view";
import { MCPCard } from "components/mcp-server/mcp-server-card";
import { trpc } from "../../trpc/server";

export default async function HomePage() {
  const { entries } = await trpc.entries.getEntries({
    pageIndex: 0,
    pageSize: 100,
  });

  return (
    <View>
      <ViewPanels>
        <ViewPanel>
          <ViewPanelContent>
            <Container className="pt-6 md:pt-12 lg:pt-16" size="lg">
              <Section>
                <SectionHeader>
                  <SectionTitle>Everything</SectionTitle>
                  <SectionDescription>
                    List of all servers in the registry.
                  </SectionDescription>
                </SectionHeader>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {entries
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((it) => {
                      return (
                        <MCPCard
                          key={it.id}
                          title={it.title}
                          description={it.description}
                          href={`/${it.name}`}
                          icon={it.icon ?? null}
                          isOfficial={it.isOfficial ?? false}
                        />
                      );
                    })}
                </div>
              </Section>
            </Container>
          </ViewPanelContent>
        </ViewPanel>
      </ViewPanels>
    </View>
  );
}
