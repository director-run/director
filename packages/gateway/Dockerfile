FROM oven/bun:1

# RUN apt-get update && apt-get install -y openssh-client && rm -rf /var/lib/apt/lists/*

COPY ./dist ./

ENV NODE_ENV=production
ENV PORT=1234

EXPOSE 1234

RUN ls -la

CMD ["bun", "server.js"]
