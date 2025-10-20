echo "----------------------------------------"
echo "- Resetting everything to a clean state"
echo "----------------------------------------"
echo 
rm .director/development/tokens/*
bun cli reset

echo
echo "----------------------------------------"
echo "- Creating a new playbook and installing the fetch server"
echo "----------------------------------------"
echo 

bun cli create test
bun cli add test --entry hackernews
bun cli update test hackernews -a toolPrefix="h_" -a disabledTools='["get_story_info", "get_user_info", "search_stories"]'

# bun cli connect test -t claude
# bun cli add test --entry fetch
bun cli add test --name custom-fetch --command "uvx mcp-server-fetch"
bun cli update test custom-fetch -a disabled=true
# 
# Oauth
# 
# Step 1: Add an oauth target to the playbook
bun cli add test --name notion --url https://mcp.notion.com/mcp
bun cli update test notion -a toolPrefix="n___" 

# Step 2: authenticate
# bun cli auth test notion

# Wait for the oauth flow to complete

# Step 4: get the connection status
# bun cli get test notion

# TODO
# TODO: get the list of tools for a server
# bun cli tools list <playbook-id> <server-name>

# TODO: call a tool on a server
# bun cli tools <playbook-id> <server-name> <tool-name> <tool-args>

# TODO: update the filtering

echo
echo "----------------------------------------"
echo "- Results"
echo "----------------------------------------"
echo

echo
echo "PLAYBOOKS:"
echo 
bun cli ls

echo
echo "PLAYBOOK DETAILS:"
echo
bun cli get test
