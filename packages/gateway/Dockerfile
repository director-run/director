FROM oven/bun:1

RUN apt-get update && apt-get install -y openssh-client && rm -rf /var/lib/apt/lists/*

COPY ./dist/server.js ./

ENV NODE_ENV=production
ENV PORT=1234

EXPOSE 1234

CMD ["bun", "server.js"]
