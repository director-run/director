FROM oven/bun:1

COPY ./dist ./

ENV NODE_ENV=production
ENV PORT=1234

EXPOSE 1234

CMD ["bun", "server.js"]
