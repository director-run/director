FROM oven/bun:1

# Install MCP server dependencies (uvx for Python servers, npx for Node servers)
RUN apt-get update && apt-get install -y pipx git && rm -rf /var/lib/apt/lists/*
RUN pipx install uv

# Add pipx and uv binaries to PATH
ENV PATH="/root/.local/bin:$PATH"

COPY ./dist ./

ENV NODE_ENV=production
ENV PORT=1234

EXPOSE 1234

CMD ["bun", "server.js"]
