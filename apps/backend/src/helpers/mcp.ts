import type { ClientRequest } from "@modelcontextprotocol/sdk/types.js";

import contentType from "content-type";
import express from "express";
import getRawBody from "raw-body";

const MAXIMUM_MESSAGE_SIZE = "4mb";

/**
 * This function was copied from the official MCP SDK.
 * It parses the body of an MCP message request as JSON.
 */
export async function parseMCPMessageBody(
  req: express.Request,
): Promise<ClientRequest> {
  const ct = contentType.parse(req.headers["content-type"] ?? "");
  if (ct.type !== "application/json") {
    throw new Error(`Unsupported content-type: ${ct}`);
  }

  const parsedBody = await getRawBody(req, {
    limit: MAXIMUM_MESSAGE_SIZE,
    encoding: ct.parameters.charset ?? "utf-8",
  });

  return JSON.parse(parsedBody);
}
