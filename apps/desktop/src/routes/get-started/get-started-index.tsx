import { Container } from "@/components/container";
import { CreateProxyForm } from "@/components/proxies/create-proxy-form";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { useNavigate } from "react-router";

export function GetStartedIndexRoute() {
  const navigate = useNavigate();

  return (
    <Container size="md">
      <Section>
        <SectionHeader>
          <SectionTitle>Create a new server</SectionTitle>
          <SectionDescription className="max-w-[50ch]">
            Servers are the core of Director that allows you to proxy multiple
            MCP servers into one easy-to-use tool.
          </SectionDescription>
        </SectionHeader>

        <CreateProxyForm
          onSuccess={(proxy) => {
            navigate(`/proxies/${proxy.id}`);
          }}
        />
      </Section>
    </Container>
  );
}
