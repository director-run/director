export {
  createGatewayClient,
  type GatewayClient,
} from "@director.run/gateway/client";

export {
  createRegistryClient,
  type RegistryClient,
  type RegistryRouterInputs,
  type RegistryRouterOutputs,
} from "@director.run/registry/client";

export function sayHello() {
  console.log("Hello, from the SDK!");
}
