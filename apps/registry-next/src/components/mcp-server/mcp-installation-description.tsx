import { assertUnreachable } from "@director.run/design/lib/assert-unreachable";
import { cn } from "@director.run/design/lib/cn";
import {
  Badge,
  BadgeGroup,
  BadgeIcon,
  BadgeLabel,
} from "@director.run/design/ui/badge";
import { Markdown } from "@director.run/design/ui/markdown";
import {
  type HTTPTransport,
  type RegistryEntry,
  type STDIOTransport,
} from "@director.run/utilities/schema";
import { GlobeIcon, TerminalIcon } from "lucide-react";
import { ComponentProps } from "react";

interface MCPServerInstallationDescriptionProps extends ComponentProps<"dl"> {
  server: RegistryEntry;
}

function STDIOTransport({ transport }: { transport: STDIOTransport }) {
  return (
    <>
      <dt>Transport</dt>
      <dd>
        <Badge variant="secondary">
          <BadgeIcon>
            <TerminalIcon />
          </BadgeIcon>
          <BadgeLabel uppercase>STDIO</BadgeLabel>
        </Badge>
      </dd>
      <dt>Command</dt>
      <dd>
        <span className="font-medium font-mono text-sm leading-6">
          {transport.command} {transport.args.join(" ")}
        </span>
      </dd>
    </>
  );
}

function HTTPTransport({ transport }: { transport: HTTPTransport }) {
  return (
    <>
      <dt>Transport</dt>
      <dd>
        <Badge variant="secondary">
          <BadgeIcon>
            <GlobeIcon />
          </BadgeIcon>
          <BadgeLabel uppercase>HTTP</BadgeLabel>
        </Badge>
      </dd>
      <dt>URL</dt>
      <dd>
        <span className="font-medium font-mono text-sm leading-6">
          {transport.url}
        </span>
      </dd>
      <dt>Headers</dt>
      <dd>
        <ul className="flex flex-col items-start gap-y-2">
          {Object.entries(transport.headers ?? {}).map(([key, value]) => (
            <li
              className="rounded-md bg-surface-neutral px-1.5 py-0.5 font-medium font-mono text-sm leading-5"
              key={key}
            >
              <span className="">{key}</span>
              <span className="text-content-tertiary">: </span>
              <span className="text-content-secondary">{value}</span>
            </li>
          ))}
        </ul>
      </dd>
    </>
  );
}

function Transport({ server }: MCPServerInstallationDescriptionProps) {
  switch (server.transport.type) {
    case "stdio":
      return <STDIOTransport transport={server.transport} />;
    case "http":
      return <HTTPTransport transport={server.transport} />;
    default:
      assertUnreachable(server.transport);
  }
}

function Parameters({
  parameters,
}: { parameters: RegistryEntry["parameters"] }) {
  if (parameters.length === 0) {
    return null;
  }

  return (
    <>
      <dt>Parameters</dt>
      <dd>
        <ul className="flex flex-col items-start">
          {parameters.map((parameter) => (
            <li
              className="flex w-full flex-col items-start gap-y-2 border-b-hairline py-4 first:pt-0 last:border-b-0 last:pb-0"
              key={parameter.name}
            >
              <div className="flex w-full flex-row flex-wrap justify-between gap-2">
                <span className="flex rounded-md bg-surface-neutral px-1.5 font-medium font-mono text-sm leading-6">
                  {parameter.name}
                </span>
                <BadgeGroup>
                  {parameter.required && (
                    <Badge variant="pink">
                      <BadgeLabel uppercase>REQUIRED</BadgeLabel>
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    <BadgeLabel uppercase>{parameter.type}</BadgeLabel>
                  </Badge>
                </BadgeGroup>
              </div>
              <Markdown className="prose-sm text-content-secondary">
                {parameter.description}
              </Markdown>
            </li>
          ))}
        </ul>
      </dd>
    </>
  );
}

export function MCPServerInstallationDescription({
  server,
  className,
  ...props
}: MCPServerInstallationDescriptionProps) {
  return (
    <dl
      className={cn(
        "grid grid-cols-[auto_1fr]",
        "[&>dt]:font-medium [&>dt]:text-content-secondary [&>dt]:text-sm [&>dt]:leading-6 [&>dt]:tracking-wide",
        "*:nth-[2]:border-t-hairline *:first:border-t-hairline",
        "*:border-b-hairline *:px-4 *:py-3 *:odd:pl-0 *:even:pr-0",
        className,
      )}
      {...props}
    >
      <Transport server={server} />
      <Parameters parameters={server.parameters} />
    </dl>
  );
}
