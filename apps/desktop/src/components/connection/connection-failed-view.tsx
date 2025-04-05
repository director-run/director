import { Container } from "@/components/container";
import { Contents, ContentsItem } from "@/components/contents";
import { Section } from "@/components/section";
import { textVariants } from "@/components/typography";
import { useGlobalQueryState } from "@/hooks/use-global-query-state";
import { cn } from "@/lib/cn";
import { NavLink } from "react-router";

export function ConnectionFailedView() {
  const { state } = useGlobalQueryState();

  return (
    <div className="flex grow flex-col items-center justify-center">
      <Container size="sm" className="gap-y-20 py-20">
        <div className="flex flex-col gap-y-20">
          <Section name="Connection">
            <div className="flex flex-col gap-2">
              <h1 className={textVariants({ variant: "h1" })}>
                Awaiting connection…
              </h1>
              <p className={textVariants({ variant: "p" })}>
                Connecting to the Director CLI on{" "}
                <code className="rounded-sm bg-gray-4 px-1 py-0.5 text-[0.925em]">
                  localhost:{state.port}
                </code>
              </p>

              <p className={cn(textVariants({ variant: "p" }), "mt-2 text-sm")}>
                <NavLink
                  to="get-started"
                  className={textVariants({ variant: "inlineLink" })}
                >
                  Running on another port?
                </NavLink>
              </p>
            </div>
          </Section>

          <Section name="Director CLI">
            <div className="flex flex-col gap-2">
              <h2 className={textVariants({ variant: "h2" })}>Director CLI</h2>
              <p className={textVariants({ variant: "p" })}>
                Make sure you have the Director CLI up and running.
              </p>

              <Contents className="my-3">
                <ContentsItem href="#">
                  Follow our installation guide
                </ContentsItem>
                <ContentsItem href="#">Run the CLI</ContentsItem>
              </Contents>

              <p className={textVariants({ variant: "p" })}>
                If you&apos;re still having trouble, feel free to contact us on{" "}
                <a href="#" className={textVariants({ variant: "inlineLink" })}>
                  Twitter
                </a>{" "}
                or{" "}
                <a href="#" className={textVariants({ variant: "inlineLink" })}>
                  Discord
                </a>
                .
              </p>
            </div>
          </Section>
        </div>
      </Container>
    </div>
  );
}
