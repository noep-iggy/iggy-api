#!/bin/bash

# Vérifiez s'il y a des migrations en attente
pending_migrations=$(npx typeorm migration:show -d ./ormconfig.ts)

if [ -z "$pending_migrations" ]; then
    echo "No pending migrations"
else
    echo "Pending migrations found"
    
    # Vérifiez si les migrations ont déjà été générées
    if [ ! -d "./src/migrations" ]; then
        echo "Generating migrations"
        npm run migrate:generate || exit 1
    else
        # Assurez-vous que le répertoire contient des fichiers de migration
        num_migrations=$(ls ./src/migrations/*.ts 2>/dev/null | wc -l)
        if [ $num_migrations -eq 0 ]; then
            echo "Generating migrations"
            npm run migrate:generate || exit 1
        fi
    fi
    
    # Exécutez les migrations
    npm run migrate:run || exit 1
fi