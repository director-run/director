echo "----------------------------------------"
echo "- Resetting everything to a clean state"
echo "----------------------------------------"
echo 

bun cli reset
bun cli client reset --target claude
bun cli client reset --target cursor
bun cli client reset --target vscode

echo
echo "----------------------------------------"
echo "- Creating a new proxy and installing the fetch server"
echo "----------------------------------------"
echo 

bun cli create my-proxy

# target
bun cli add my-proxy --entry fetch
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
bun cli get my-proxy

# TODO: cursor seems to be segfaulting, something is weird with it