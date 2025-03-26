import { Container } from "@/components/container";
import { DefaultLayoutContent } from "@/components/layouts/default-layout";
import { Section } from "@/components/section";

export default async function HomePage() {
  return (
    <DefaultLayoutContent>
      <Container className="gap-y-24">
        <Section name="introduction">
          <h1 className="text-balance font-normal font-sans text-2xl leading-tight tracking-wide before:mr-2 before:text-gray-8 before:tracking-widest before:content-['#'] dark:font-light">
            This is a catchy title that will make you want to use this product.
          </h1>

          <p className="text-pretty font-light text-gray-11">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex nam
            eveniet cupiditate incidunt ratione aperiam odit quos quae
            explicabo! Inventore ipsam aut sunt rem libero saepe. Numquam vitae
            eius voluptates.
          </p>
        </Section>

        <Section name="get-started">
          <h2 className="text-balance font-normal font-sans text-xl leading-tight tracking-wider before:mr-2 before:text-gray-8 before:tracking-widest before:content-['##'] dark:font-light">
            Get started in seconds
          </h2>

          <p className="text-pretty font-light text-gray-11">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex nam
            eveniet cupiditate incidunt ratione aperiam odit quos quae
            explicabo! Inventore ipsam aut sunt rem libero saepe. Numquam vitae
            eius voluptates.
          </p>
        </Section>

        <Section name="features">
          <h2 className="text-balance font-normal font-sans text-xl leading-tight tracking-wider before:mr-2 before:text-gray-8 before:tracking-widest before:content-['##'] dark:font-light">
            Features
          </h2>

          <p className="text-pretty font-light text-gray-11">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex nam
            eveniet cupiditate incidunt ratione aperiam odit quos quae
            explicabo! Inventore ipsam aut sunt rem libero saepe. Numquam vitae
            eius voluptates.
          </p>
        </Section>
      </Container>
    </DefaultLayoutContent>
  );
}
