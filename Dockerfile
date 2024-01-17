# Stage 1: Build Stage
FROM node:19 AS builder
WORKDIR /app
COPY ./package.json ./
COPY .env.production .env
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Stage
FROM node:19-alpine
WORKDIR /app
COPY --from=builder /app ./

# Installation de bash, si nécessaire
RUN apk --no-cache add bash

# Votre script en ligne
RUN pending_migrations=$(npx typeorm migration:show -d ./ormconfig.ts) && \
    if [ -z "$pending_migrations" ]; then \
        echo "No pending migrations"; \
    else \
        echo "Pending migrations found"; \
        if [ ! -d "./src/migrations" ]; then \
            echo "Generating migrations"; \
            npm run migrate:generate || exit 1; \
        else \
            num_migrations=$(ls ./src/migrations/*.ts 2>/dev/null | wc -l); \
            if [ $num_migrations -eq 0 ]; then \
                echo "Generating migrations"; \
                npm run migrate:generate || exit 1; \
            fi; \
        fi; \
        npm run migrate:run || exit 1; \
    fi

# Commande finale pour démarrer l'application
CMD ["npm", "run", "start:prod"]
