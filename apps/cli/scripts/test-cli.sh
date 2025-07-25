echo "----------------------------------------"
echo "- Resetting everything to a clean state"
echo "----------------------------------------"
echo 
bun cli reset

echo
echo "----------------------------------------"
echo "- Creating a new proxy and installing the fetch server"
echo "----------------------------------------"
echo 

bun cli create test
bun cli add test --entry hackernews
bun cli add test --entry fetch
bun cli add test --name notion --url https://mcp.notion.com/mcp
bun cli add test --name github --url https://api.githubcopilot.com/mcp/
bun cli add test --name custom-fetch --command "uvx mcp-server-fetch"
# bun cli connect my-proxy --target claude
# TODO
# bun cli connect my-proxy
# bun cli cursor install my-proxy

echo
echo "----------------------------------------"
echo "- Results"
echo "----------------------------------------"
echo

echo
echo "PROXIES:"
echo 
bun cli ls

echo
echo "PROXY DETAILS:"
echo
bun cli get test
