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
import { Button } from "@director.run/design/ui/button";
import { MCPCard } from "components/mcp-server/mcp-server-card";
import { MCPServerList } from "components/mcp-server/mcp-server-list";
import { trpc } from "../../trpc/server";

interface HomePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ query?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { query } = await searchParams;

  const data = await trpc.entries.getEntries({
    pageIndex: 0,
    pageSize: 20,
    searchQuery: query,
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

                <MCPServerList />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.entries.map((it) => {
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
                {data.pagination.hasPreviousPage && (
                  <Button variant="tertiary" size="sm">
                    Previous page
                  </Button>
                )}
                {data.pagination.hasNextPage && (
                  <Button variant="tertiary" size="sm">
                    Next page
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
