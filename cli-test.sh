echo "----------------------------------------"
echo "- Resetting everything to a clean state"
echo "----------------------------------------"
echo 

bun cli reset
bun cli claude purge
bun cli cursor purge
echo
echo "----------------------------------------"
echo "- Creating a new proxy and installing the fetch server"
echo "----------------------------------------"
echo 

bun cli create my-proxy
bun cli registry install my-proxy fetch
# bun cli claude install my-proxy
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