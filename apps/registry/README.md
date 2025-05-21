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
createdb -h localhost -p 5432 -U postgres director-registry-test
createdb -h localhost -p 5432 -U postgres director-registry-dev

# Drop DB
dropdb -h localhost -p 5432 -U postgres director-registry-test
dropdb -h localhost -p 5432 -U postgres director-registry-dev

# Push DB Changes
bun run db:push # dev
NODE_ENV=test bun run db:push # test
```

### Deployment
- It deploys using vercel
- It's accessible at `https://registry.director.run`
- It exports one function: `api/index.js`
- To run scripts/commands (e.g: `bun run db:migrate`), set local environment variables to the ones on vercel and run locally