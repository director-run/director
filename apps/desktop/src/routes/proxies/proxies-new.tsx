import { Container } from "@/components/container";
import { CreateProxyForm } from "@/components/proxies/create-proxy-form";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/section";
import { useNavigate } from "react-router";

export function ProxiesNewRoute() {
  const navigate = useNavigate();

  return (
    <Container size="sm">
      <Section>
        <SectionHeader>
          <SectionTitle>New proxy</SectionTitle>
          <SectionDescription>Create a new proxy</SectionDescription>
        </SectionHeader>
        <SectionSeparator />
        <CreateProxyForm
          onSuccess={(res) => {
            navigate(`/${res.id}`);
          }}
        />
      </Section>
    </Container>
  );
}
