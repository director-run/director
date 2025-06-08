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

bun cli create my-proxy
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
