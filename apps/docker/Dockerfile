FROM oven/bun:1.1-slim AS builder

WORKDIR /app

# Copy the monorepo source code
COPY . .

# Install dependencies and build
RUN bun install
RUN bun run build

FROM oven/bun:1.1-slim AS runner
WORKDIR /app

# Install system dependencies that might be needed by MCP servers
RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3-pip \
    pipx \
    && rm -rf /var/lib/apt/lists/*

# Install uv for Python MCP servers
RUN pipx install uv
ENV PATH="/root/.local/bin:${PATH}"

# Create director directory
RUN mkdir -p /root/.director

# Copy built files and dependencies from builder
COPY --from=builder /app /app

ENV GATEWAY_PORT=8080
EXPOSE ${GATEWAY_PORT}

# Run the local built CLI
CMD ["bun", "run", "./apps/cli/bin/cli.ts", "serve"]