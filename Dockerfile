FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN corepack enable

# ---------- DEV ----------
FROM base AS dev
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma generate
EXPOSE 3000
CMD ["pnpm", "start:dev"]

# ---------- BUILD ----------
FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma generate && pnpm build

# ---------- PROD ----------
FROM node:20-alpine AS prod
WORKDIR /usr/src/app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /usr/src/app/dist ./dist
COPY prisma ./prisma
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
