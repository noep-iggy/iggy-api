help:
	@echo "Liste des commandes disponibles :"
	@grep -E '^[1-9a-zA-Z_-]+(\.[1-9a-zA-Z_-]+)?:.*?## .*$$|(^#--)' $(MAKEFILE_LIST) \
	| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m %-43s\033[0m %s\n", $$1, $$2}' \
	| sed -e 's/\[32m #-- /[33m/'

#-- PROJECT
start:  ## Start project
	yarn start:dev

#-- DATABASE
db.create: ## Create database
	@echo "Removing old db_data..."
	@make db.delete
	@echo "Starting Docker Compose..."
	@docker-compose up -d
	@echo "Sleeping for 5 seconds..."
	@sleep 5
	@echo "Running make migration..."
	@make migration


db.delete: ## Delete database
	docker-compose down && rm -rf ./db_data && rm -rf ./src/migrations

db.start: ## Start database
	docker start iggy-db
	
db.stop: ## Stop database
	docker stop iggy-db

#-- TYPEORM
module.create: ## Create module
	@read -p "Entrer le nom du module: " name; \
	upperName=$$(echo $$name | awk '{print toupper(substr($$0,1,1)) tolower(substr($$0,2))}'); \
	allUpperName=$$(echo $$name | awk '{print toupper($$0)}'); \
	nest g module modules/$$name --no-spec; \
	nest g service modules/$$name --no-spec; \
	nest g controller modules/$$name --no-spec; \
	touch ./src/modules/$$name/$$name.entity.ts; \
	echo "import { Entity, PrimaryGeneratedColumn } from 'typeorm';\nimport { BaseEntity } from '../base.entity';\n\n@Entity()\nexport class $${upperName} extends BaseEntity {\n	@PrimaryGeneratedColumn('uuid')\n	id: string;\n}" >> ./src/modules/$$name/$$name.entity.ts; \
	touch ./src/types/api/$$upperName.ts; \
	echo "export interface Create$${upperName}Api {}\n\nexport interface Update$${upperName}Api {}" >> ./src/types/api/$$upperName.ts; \
	echo "export * from './$${upperName}';" >> ./src/types/api/index.ts; \
	touch ./src/types/dto/$$upperName.ts; \
	echo "import { BaseDto } from './BaseDto';\n\nexport interface $${upperName}Dto extends BaseDto {}" >> ./src/types/dto/$$upperName.ts; \
	echo "export * from './$${upperName}';" >> ./src/types/dto/index.ts; \
	touch ./src/validations/$$name.ts; \
	echo "import { Create$${upperName}Api, Update$${upperName}Api } from 'src/types';\nimport * as yup from 'yup';\n\nconst create: yup.ObjectSchema<Create$${upperName}Api> = yup.object({});\n\nconst update: yup.ObjectSchema<Update$${upperName}Api> = yup.object({});\n\nexport const $${name}Validation = {\n  create,\n  update,\n};" >> ./src/validations/$$name.ts; \
	echo "export * from './$${name}';" >> ./src/validations/index.ts; \

#-- MIGRATION
migration: ## Generate migration and push on server
	make migration.create && make migration.push

migration.create: ## Generate migration 
	@read -p "Entrer le nom de la migration (default: migration): " name; \
	name=$${name:-migration}; \
	npx ts-node ./node_modules/.bin/typeorm migration:generate ./src/migrations/$$name -d ormconfig.ts


migration.push: ## Push migration on server
	npx ts-node ./node_modules/.bin/typeorm migration:run -d ormConfig.ts