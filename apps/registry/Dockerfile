FROM oven/bun:1

# Install MCP server dependencies (uvx for Python servers, npx for Node servers)
RUN apt-get update && apt-get install -y pipx git nodejs npm && rm -rf /var/lib/apt/lists/*
RUN pipx install uv

# Add pipx binaries (uvx) to PATH
ENV PATH="/root/.local/bin:$PATH"

COPY ./dist ./
COPY ./public ./public

ENV NODE_ENV=production
ENV PORT=3080

EXPOSE 3080

CMD ["bun", "server.js"]
