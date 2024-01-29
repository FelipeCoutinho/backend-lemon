# build
FROM node:18-alpine AS builder
WORKDIR /app

RUN apk update && apk add python3 make g++

COPY package.json . ./
COPY package-lock.json . ./
COPY prisma ./prisma
RUN npm ci --only=production
RUN npm install
RUN npm run prisma:generate

COPY . ./
RUN npm run build
RUN npm prune --production
# release
FROM node:18-alpine
WORKDIR /app

# env vars
ENV NODE_ENV=production

# copy
COPY --from=builder /app/package.json /app/
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules

# run
EXPOSE 3001
CMD ["node", "dist/main.js"]