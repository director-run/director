import { PlugsIcon, SmileyXEyesIcon } from "@phosphor-icons/react";
import { Container } from "../../ui/container";
import { Logo } from "../../ui/icons/logo";
import { SectionDescription, SectionTitle } from "../../ui/section";
import { Section, SectionHeader } from "../../ui/section";

type IconType = "dead-smiley" | "director" | "plugs";

export function FullScreenError({
  icon = "director",
  fullScreen = false,
  title,
  subtitle,
  data,
}: {
  icon?: IconType;
  fullScreen?: boolean;
  title?: string;
  subtitle?: string;
  data?: object | string;
}) {
  return (
    <div
      className={
        fullScreen ? "flex min-h-dvh w-full items-center justify-center" : ""
      }
    >
      <Container size="sm" className="w-full py-12 lg:py-16">
        <Section className="gap-y-8">
          {getIcon(icon)}
          <SectionHeader className="items-center gap-y-1.5 text-center">
            {title && (
              <SectionTitle className="font-medium text-2xl">
                {title}
              </SectionTitle>
            )}
            {subtitle && (
              <SectionDescription className="text-base">
                {subtitle}
              </SectionDescription>
            )}
          </SectionHeader>
          {data && (
            <pre className="max-h-[300px] w-full overflow-y-auto rounded-xl bg-accent p-4 text-left font-mono text-sm">
              <code>
                {data
                  ? typeof data === "string"
                    ? data
                    : JSON.stringify(data, null, 2)
                  : ""}
              </code>
            </pre>
          )}
        </Section>
      </Container>
    </div>
  );
}

function getIcon(icon: IconType) {
  switch (icon) {
    case "dead-smiley":
      return <SmileyXEyesIcon weight="fill" className="mx-auto size-10" />;
    case "plugs":
      return <PlugsIcon weight="fill" className="mx-auto size-10" />;
    case "director":
      return <Logo className="mx-auto" />;
  }
}
