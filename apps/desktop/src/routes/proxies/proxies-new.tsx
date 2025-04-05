import { Container } from "@/components/container";
import { CreateProxyForm } from "@/components/proxies/create-proxy-form";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/section";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export function ProxiesNewRoute() {
  const navigate = useNavigate();

  return (
    <Container size="sm">
      <Button
        className="absolute top-4 left-4"
        type="button"
        variant="secondary"
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
      <Section>
        <SectionHeader>
          <SectionTitle>New proxy</SectionTitle>
          <SectionDescription>Create a new proxy</SectionDescription>
        </SectionHeader>
        <SectionSeparator />
        <CreateProxyForm
          onSuccess={(res) => {
            navigate(`/proxies/${res.id}`);
          }}
        />
      </Section>
    </Container>
  );
}
