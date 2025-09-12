// Mock for Storybook to avoid server-side imports

export function createGatewayClient(_url: string) {
  return {
    // Mock TRPC client methods that might be needed in Storybook
    query: () => Promise.resolve({}),
    mutate: () => Promise.resolve({}),
    subscription: () => ({
      subscribe: () => ({ unsubscribe: () => {} })
    }),
  };
}

export const GatewayRouterOutputs = {};