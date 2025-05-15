import { z } from "zod";
import { SimpleServer } from "../simple-server";

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