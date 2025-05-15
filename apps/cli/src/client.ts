import { createGatewayClient } from "@director.run/gateway/client";
import { env } from "./config";

export const gatewayClient = createGatewayClient(env.GATEWAY_URL);
