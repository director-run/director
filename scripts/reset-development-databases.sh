#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Drop gateway databases (IF EXISTS to avoid errors when databases don't exist)
docker exec director-postgres psql -U postgres -c "DROP DATABASE IF EXISTS \"director-gateway-test\";"
docker exec director-postgres psql -U postgres -c "DROP DATABASE IF EXISTS \"director-gateway-dev\";"

# # Create gateway databases
docker exec director-postgres psql -U postgres -c "CREATE DATABASE \"director-gateway-test\";"
docker exec director-postgres psql -U postgres -c "CREATE DATABASE \"director-gateway-dev\";"

cd apps/gateway 

bun run dotenvx run -f env/.env.development -- bun run db:push 
bun run dotenvx run -f env/.env.test -- bun run db:push 

NODE_ENV=development bun run bin/seed.ts


# Drop gateway databases (IF EXISTS to avoid errors when databases don't exist)
docker exec director-postgres psql -U postgres -c "DROP DATABASE IF EXISTS \"director-registry-test\";"
docker exec director-postgres psql -U postgres -c "DROP DATABASE IF EXISTS \"director-registry-dev\";"

# # Create gateway databases
docker exec director-postgres psql -U postgres -c "CREATE DATABASE \"director-registry-test\";"
docker exec director-postgres psql -U postgres -c "CREATE DATABASE \"director-registry-dev\";"

cd ../../apps/registry 

bun run dotenvx run -f env/.env.dev -- bun run db:push 
bun run dotenvx run -f env/.env.test -- bun run db:push 
