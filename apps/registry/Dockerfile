FROM oven/bun:1

COPY ./dist ./

ENV NODE_ENV=production
ENV PORT=3080

EXPOSE 3080

CMD ["bun", "api.js"]
