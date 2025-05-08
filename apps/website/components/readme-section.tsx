interface ReadmeSectionProps {
  readme: string
}

export default function ReadmeSection({ readme }: ReadmeSectionProps) {
  if (!readme) {
    return <p className="text-gray-500">No README available for this server.</p>
  }

  // For simplicity, we're just rendering the readme as is
  // In a real app, you might want to use a markdown renderer
  return (
    <div className="prose max-w-none">
      <h1>Stripe Model Context Protocol</h1>

      <p>
        The Stripe{" "}
        <a href="#" className="font-medium">
          Model Context Protocol
        </a>{" "}
        server allows you to integrate with Stripe APIs through function calling. This protocol supports various tools
        to interact with different Stripe services.
      </p>

      <h2>Setup</h2>

      <p>To run the Stripe MCP server using npx, use the following command:</p>

      <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm whitespace-pre overflow-x-auto">
        {`# To set up all available tools
npx -y @stripe/mcp --tools=all --api-key=YOUR_STRIPE_SECRET_KEY

# To set up specific tools
npx -y @stripe/mcp --tools=customers.create,customers.read,products.create --api-key=YOUR_STRIPE_SECRET_KEY

# To configure a Stripe connected account
npx -y @stripe/mcp --tools=all --api-key=YOUR_STRIPE_SECRET_KEY --stripe-account=CONNECTED_ACCOUNT_ID`}
      </div>
    </div>
  )
}
