import { assertUnreachable } from "@/lib/assert-unreachable";
import { getDeterministicColor } from "@/lib/deterministic-colors";
import { HTTPTransport, STDIOTransport } from "@director.run/mcp/types";
import { Badge } from "../ui/badge";
import {
  DescriptionDetail,
  DescriptionList,
  DescriptionTerm,
} from "../ui/description-list";

export function McpDescriptionList({
  transport,
}: { transport: HTTPTransport | STDIOTransport }) {
  switch (transport.type) {
    case "http":
      return <McpSseDescriptionList transport={transport} />;
    case "stdio":
      return <McpStdioDescriptionList transport={transport} />;
    default:
      assertUnreachable(transport);
  }
}

function McpStdioDescriptionList({ transport }: { transport: STDIOTransport }) {
  const args = transport.args ?? [];
  const env = transport.env ?? [];

  return (
    <DescriptionList>
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

function McpSseDescriptionList({ transport }: { transport: HTTPTransport }) {
  return (
    <DescriptionList>
      <DescriptionTerm>Type</DescriptionTerm>
      <DescriptionDetail>
        <Badge variant={getDeterministicColor("sse")}>SSE</Badge>
      </DescriptionDetail>
      <DescriptionTerm>URL</DescriptionTerm>
      <DescriptionDetail>{transport.url}</DescriptionDetail>
    </DescriptionList>
  );
}
