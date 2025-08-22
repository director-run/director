# Director Docker Image

This allows you to run the Director gateway inside a docker image

## Quick Start

```bash
docker run -d -p 8080:8080 -v ./data:/root/.director --name director barnaby/director:latest
docker logs -f director

GATEWAY_URL=http://localhost:8080 director create my-proxy
GATEWAY_URL=http://localhost:8080 director add my-proxy --entry fetch
```


## Development

#### Build & Run
```bash
docker build -t director:latest .
docker run -d \
  -p 8080:8080 \
  -e GATEWAY_PORT=8080 \
  -v ./data:/root/.director \
  --name director \
  director:latest

# tail the logs
docker logs -f director

# install the client on the host
npm install -g @director.run/cli
GATEWAY_URL=http://localhost:8080 director ls

# run a command inside the conatiner
docker exec -it director npx

```
#### Teardown
```bash
docker rm -f director
```

#### Using docker-compose
TODO
```bash
docker compose up -d
docker compose down
```

## Releasing
```bash
./scripts/release.sh
```