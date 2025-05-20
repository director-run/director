import { HTTPTransport, STDIOTransport } from "@director.run/mcp/types";
import { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import {
  DescriptionDetail,
  DescriptionList,
  DescriptionTerm,
} from "@/components/ui/description-list";
import { assertUnreachable } from "@/lib/assert-unreachable";
import { getDeterministicColor } from "@/lib/deterministic-colors";

interface McpDescriptionListProps
  extends ComponentProps<typeof DescriptionList> {
  transport: HTTPTransport | STDIOTransport;
}

export function McpDescriptionList({
  transport,
  ...props
}: McpDescriptionListProps) {
  switch (transport.type) {
    case "http":
      return <McpSseDescriptionList transport={transport} {...props} />;
    case "stdio":
      return <McpStdioDescriptionList transport={transport} {...props} />;
    default:
      assertUnreachable(transport);
  }
}

interface McpStdioDescriptionListProps
  extends ComponentProps<typeof DescriptionList> {
  transport: STDIOTransport;
}

function McpStdioDescriptionList({
  transport,
  ...props
}: McpStdioDescriptionListProps) {
  const args = transport.args ?? [];
  const env = transport.env ?? [];

  return (
    <DescriptionList {...props}>
      <DescriptionTerm>Type</DescriptionTerm>
      <DescriptionDetail>
        <Badge variant={getDeterministicColor("stdio")}>STDIO</Badge>
      </DescriptionDetail>
      <DescriptionTerm>Command</DescriptionTerm>
      <DescriptionDetail>
        <Badge variant={getDeterministicColor(transport.command)}>
          {transport.command}
        </Badge>
      </DescriptionDetail>
      {args.length > 0 && (
        <>
          <DescriptionTerm>Arguments</DescriptionTerm>
          <DescriptionDetail>
            <div className="flex flex-row flex-wrap gap-1">
              {args.map((it) => (
                <Badge variant="secondary" key={it}>
                  {it}
                </Badge>
              ))}
            </div>
          </DescriptionDetail>
        </>
      )}
      {Object.keys(env).length > 0 && (
        <>
          <DescriptionTerm>Environment</DescriptionTerm>
          <DescriptionDetail>
            <div className="flex flex-row flex-wrap gap-1">
              {Object.entries(env).map(([key, value]) => (
                <Badge variant="secondary" key={key}>
                  {`${key}=${value}`}
                </Badge>
              ))}
            </div>
          </DescriptionDetail>
        </>
      )}
    </DescriptionList>
  );
}

interface McpSseDescriptionListProps
  extends ComponentProps<typeof DescriptionList> {
  transport: HTTPTransport;
}

function McpSseDescriptionList({
  transport,
  ...props
}: McpSseDescriptionListProps) {
  return (
    <DescriptionList {...props}>
      <DescriptionTerm>Type</DescriptionTerm>
      <DescriptionDetail>
        <Badge variant={getDeterministicColor(transport.type)}>
          {transport.type}
        </Badge>
      </DescriptionDetail>
      <DescriptionTerm>URL</DescriptionTerm>
      <DescriptionDetail>{transport.url}</DescriptionDetail>
    </DescriptionList>
  );
}
