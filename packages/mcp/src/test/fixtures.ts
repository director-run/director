import { z } from "zod";
import { SimpleServer } from "../simple-server";
import type { ProxyTargetAttributes } from "@director.run/utilities/schema";

export function makeEchoServer() {
  const server = new SimpleServer("echo-server");
  server
    .tool("echo")
    .description("Echo a message")
    .schema(z.object({ message: z.string() }))
    .handle(async ({ message }) => {
      return { message };
    });
  return server;
}

export function makeFooBarServer() {
  const server = new SimpleServer("echo-server");
  server
    .tool("foo")
    .description("Foo the bar")
    .schema(z.object({ message: z.string() }))
    .handle(async ({ message }) => {
      return { message };
    });
  return server;
}

export function makeHTTPTargetConfig(params: { name: string; url: string }): ProxyTargetAttributes {
  return {
    name: params.name,
    transport: {
      type: "http",
      url: params.url,
    },
  };
}

