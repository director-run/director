# Registry Backend & Client


### Development

```
# Start Postgres DB
$ docker compose up -d

# Stop PG and remove all containers, networks, and volumes
$ docker compose down -v

# Connect to DB
$ psql 'postgresql://postgres:travel-china-spend-nothing@localhost:5432/'
```