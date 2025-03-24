import { Container } from "@/components/container";
import { DefaultLayoutContent } from "@/components/layouts/default-layout";

export default async function HomePage() {
  return (
    <DefaultLayoutContent>
      <Container>
        <div>Content goes here</div>
      </Container>
    </DefaultLayoutContent>
  );
}
