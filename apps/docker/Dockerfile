FROM oven/bun:1-slim AS builder

WORKDIR /app

# Copy the monorepo source code
COPY . .

# Install dependencies and build
RUN bun install
RUN bun run build

FROM oven/bun:1-slim AS runner
WORKDIR /app

# Install system dependencies that might be needed by MCP servers
RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3-pip \
    python3-venv \
    pipx \
    && rm -rf /var/lib/apt/lists/*

# Install uv for Python MCP servers using pipx
RUN pipx install uv
ENV PATH="/root/.local/bin:${PATH}"

# Create director directory
RUN mkdir -p /root/.director

# Copy built files and dependencies from builder
COPY --from=builder /app /app

ENV GATEWAY_PORT=8080
EXPOSE ${GATEWAY_PORT}

# Create a wrapper script for the director executable
RUN echo '#!/bin/sh' > /usr/local/bin/director && \
    echo 'exec bun run /app/apps/cli/bin/cli.ts "$@"' >> /usr/local/bin/director && \
    chmod +x /usr/local/bin/director

# Run the local built CLI
CMD ["bun", "run", "/app/apps/cli/bin/cli.ts", "serve"]