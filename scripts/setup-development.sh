# Create registry databases
docker exec -it director-postgres psql -U postgres -c "CREATE DATABASE \"director-registry-test\";"
docker exec -it director-postgres psql -U postgres -c "CREATE DATABASE \"director-registry-dev\";"

# Create gateway databases
docker exec -it director-postgres psql -U postgres -c "CREATE DATABASE \"director-gateway-test\";"
docker exec -it director-postgres psql -U postgres -c "CREATE DATABASE \"director-gateway-dev\";"

# Push schema to databases
cd apps/registry
bun run db:push # push schema to development db
NODE_ENV=test bun run db:push # push schema to test db