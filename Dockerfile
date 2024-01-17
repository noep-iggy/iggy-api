# Builder image
FROM node:19-alpine AS builder
WORKDIR /app
COPY ./package.json ./
COPY .env.production .env
RUN npm install --production \
    && npm run build \
    && npm prune --production

# Image finale
FROM node:19-alpine
WORKDIR /app
COPY --from=builder /app ./
CMD ["npm", "run", "start:prod"]
