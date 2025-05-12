# Registry Backend


### Development

```bash
# Start Postgres DB
docker compose up -d

# Stop PG and remove all containers, networks, and volumes
docker compose down -v

# Connect to DB
psql 'postgresql://postgres:travel-china-spend-nothing@localhost:5432/'

# Create DB
createdb -h localhost -p 5432 -U postgres director-registry

# Drop DB
dropdb -h localhost -p 5432 -U postgres director-registry

# Push DB Changes
bun run drizzle-kit push
```