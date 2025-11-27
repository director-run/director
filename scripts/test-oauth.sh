

OAUTH_SERVER_URL=https://mcp.notion.com/mcp
director create test
director add test --name notion --url $OAUTH_SERVER_URL
director ls