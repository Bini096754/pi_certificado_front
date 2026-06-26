FROM oven/bun AS base

WORKDIR /app

COPY . .

FROM base AS dev
RUN bun i
EXPOSE 5173
CMD ["bun", "run", "dev"]

FROM base AS prod
RUN bun i
RUN bun run build
EXPOSE 5174
CMD ["bun", "run", "preview"]
