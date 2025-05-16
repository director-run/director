import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full grow items-center justify-center">
      <Container>
        <Section name="not-found">
          <SectionHeader>
            <SectionTitle>Proxy not found</SectionTitle>
            <SectionDescription>
              The proxy you are looking for does not exist.
            </SectionDescription>
          </SectionHeader>
          <Button className="self-start" asChild>
            <Link href="/proxies">Go home</Link>
          </Button>
        </Section>
      </Container>
    </div>
  );
}
