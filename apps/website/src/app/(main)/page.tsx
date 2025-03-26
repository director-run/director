import { Container } from "@/components/container";
import { DefaultLayoutContent } from "@/components/layouts/default-layout";
import { Section } from "@/components/section";
import { Step, Steps } from "@/components/steps";
import {} from "@director.run/ui/primitives/card";
import { CodeBlock } from "@director.run/ui/primitives/code-block";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@director.run/ui/primitives/tabs";

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

          <Tabs defaultValue="desktop" className="mt-4">
            <TabsList>
              <TabsTrigger value="desktop">Desktop</TabsTrigger>
              <TabsTrigger value="cli">CLI</TabsTrigger>
            </TabsList>
            <TabsContent value="desktop">
              <Steps className="gap-y-0 rounded-sm border-2">
                <Step title="Download and install" className="border-b-2 p-4">
                  <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Aliquam cum hic nobis architecto iste aperiam facilis? Alias
                    odio pariatur dolore consequatur iusto beatae. Molestias
                    placeat at ipsum architecto. Voluptatum, fuga?
                  </p>
                  <CodeBlock lang="bash" className="my-3">
                    {["$ npm install @director.run/cli"].join("\n")}
                  </CodeBlock>
                  <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Aliquam cum hic nobis architecto iste aperiam facilis? Alias
                    odio pariatur dolore consequatur iusto beatae. Molestias
                    placeat at ipsum architecto. Voluptatum, fuga?
                  </p>
                </Step>
                <Step
                  title="Create your first server"
                  className="border-b-2 p-4"
                >
                  <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Aliquam cum hic nobis architecto iste aperiam facilis? Alias
                    odio pariatur dolore consequatur iusto beatae. Molestias
                    placeat at ipsum architecto. Voluptatum, fuga?
                  </p>
                </Step>
                <Step
                  title="Connect your favorite AI powered applications"
                  className="border-b-2 p-4"
                >
                  <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Aliquam cum hic nobis architecto iste aperiam facilis? Alias
                    odio pariatur dolore consequatur iusto beatae. Molestias
                    placeat at ipsum architecto. Voluptatum, fuga?
                  </p>
                </Step>
                <Step title="Do your thing" className="p-4">
                  <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Aliquam cum hic nobis architecto iste aperiam facilis? Alias
                    odio pariatur dolore consequatur iusto beatae. Molestias
                    placeat at ipsum architecto. Voluptatum, fuga?
                  </p>
                </Step>
              </Steps>
            </TabsContent>
            <TabsContent value="cli">
              <Steps className="gap-y-0 rounded-sm border-2">
                <Step title="Install the CLI" className="border-b-2 p-4">
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Praesentium quaerat error, veritatis architecto quisquam.
                  </p>
                  <CodeBlock lang="bash" className="my-3">
                    {["$ npm install @director.run/cli"].join("\n")}
                  </CodeBlock>
                </Step>
                <Step
                  title="Create your first server"
                  className="border-b-2 p-4"
                >
                  <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Aliquam cum hic nobis architecto iste aperiam facilis? Alias
                    odio pariatur dolore consequatur iusto beatae. Molestias
                    placeat at ipsum architecto. Voluptatum, fuga?
                  </p>
                  <CodeBlock lang="bash" className="my-3">
                    {["$ director new my-test-server"].join("\n")}
                  </CodeBlock>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Praesentium quaerat error, veritatis architecto quisquam.
                  </p>
                  <CodeBlock lang="bash" className="my-3">
                    {["$ director add fs my-test-server"].join("\n")}
                  </CodeBlock>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Praesentium quaerat error, veritatis architecto quisquam.
                  </p>
                  <CodeBlock lang="bash" className="my-3">
                    {["$ director start my-test-server"].join("\n")}
                  </CodeBlock>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Praesentium quaerat error, veritatis architecto quisquam.
                  </p>
                </Step>
                <Step
                  title="Connect your favorite AI powered applications"
                  className="border-b-2 p-4"
                >
                  <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Aliquam cum hic nobis architecto iste aperiam facilis? Alias
                    odio pariatur dolore consequatur iusto beatae. Molestias
                    placeat at ipsum architecto. Voluptatum, fuga?
                  </p>
                </Step>
                <Step title="Do your thing" className="p-4">
                  <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Aliquam cum hic nobis architecto iste aperiam facilis? Alias
                    odio pariatur dolore consequatur iusto beatae. Molestias
                    placeat at ipsum architecto. Voluptatum, fuga?
                  </p>
                </Step>
              </Steps>
            </TabsContent>
          </Tabs>
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
