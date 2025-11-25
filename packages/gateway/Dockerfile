FROM oven/bun:1

#
# Install MCP dependencies
# 
RUN apt-get update 

# Install dependencies
RUN apt-get install -y \
    curl \
    git \
    python3-pip \
    pipx 

# Used by many MCP servers
RUN pipx install uv
#
#
#


COPY ./dist ./

ENV NODE_ENV=production
ENV PORT=1234

EXPOSE 1234

CMD ["bun", "server.js"]
