import {
  LayoutNavigation,
  LayoutView,
  LayoutViewContent,
} from "@/components/layout/layout";
import { NewProxyForm } from "@/components/proxies/proxy-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";

export default function NewProxyPage() {
  return (
    <LayoutView>
      <LayoutNavigation>
        <Breadcrumb className="grow">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>New proxy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </LayoutNavigation>

      <LayoutViewContent>
        <Container size="sm">
          <Section className="gap-y-8">
            <SectionHeader>
              <SectionTitle>New proxy</SectionTitle>
              <SectionDescription>
                Create a new proxy to start using MCP.
              </SectionDescription>
            </SectionHeader>
            <SectionSeparator />
            <NewProxyForm />
          </Section>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}
