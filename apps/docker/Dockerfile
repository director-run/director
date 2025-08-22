FROM node:20-slim

# Update dependencies
RUN apt-get update 

# Install dependencies
RUN apt-get install -y \
    curl \
    git \
    python3-pip \
    pipx 

# Used by many MCP servers
RUN pipx install uv

# Add pipx bin directory to PATH so uvx is available
ENV PATH="/root/.local/bin:${PATH}"

# Create director directory for volume mounting
RUN mkdir -p /root/.director

# Install Director CLI globally
RUN npm install -g @director.run/cli@latest

# Set default port
ENV GATEWAY_PORT=8080

# Expose the gateway port
EXPOSE ${GATEWAY_PORT}

# Create a simple healthcheck
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:${GATEWAY_PORT}/health || exit 1

# Run director serve
CMD ["sh", "-c", "director serve"]