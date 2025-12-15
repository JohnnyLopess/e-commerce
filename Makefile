.PHONY: build-dev build-prod up-dev up-prod dev prod stop clean logs install lint test build shell help

# ==================== DOCKER BUILD ====================

## Builda imagem de desenvolvimento
build-dev:
	docker compose build dev

## Builda imagem de produção
build-prod:
	docker compose build prod

# ==================== DOCKER UP ====================

## Sobe container de desenvolvimento (builda se necessário)
up-dev:
	docker compose up dev

## Sobe container de produção (builda se necessário)
up-prod:
	docker compose up prod -d

## Força rebuild + Up desenvolvimento
dev:
	docker compose up dev --build

## Força rebuild + Up produção
prod:
	docker compose up prod --build -d

# ==================== DOCKER CONTROL ====================

## Para containers
stop:
	docker compose down

## Remove tudo (containers, imagens, volumes)
clean:
	docker compose down --rmi all --volumes --remove-orphans

## Mostra logs
logs:
	docker compose logs -f

# ==================== COMANDOS NO CONTAINER ====================

## Instala dependências
install:
	docker compose run --rm dev npm install

## Executa lint
lint:
	docker compose run --rm dev npm run lint

## Executa testes
test:
	docker compose run --rm dev npm run test:ci

## Gera build de produção
build:
	docker compose run --rm dev npm run build

## Acessa o shell do container
shell:
	docker compose run --rm dev sh

# ==================== HELP ====================

help:
	@echo ""
	@echo "Docker:"
	@echo "  make build-dev  - Builda imagem dev"
	@echo "  make build-prod - Builda imagem prod"
	@echo "  make up-dev     - Sobe container (builda se necessário)"
	@echo "  make up-prod    - Sobe container prod"
	@echo "  make dev        - Força rebuild + up dev"
	@echo "  make prod       - Força rebuild + up prod"
	@echo "  make stop       - Para containers"
	@echo "  make clean      - Remove tudo"
	@echo "  make logs       - Mostra logs"
	@echo ""
	@echo "Comandos:"
	@echo "  make install    - Instala dependências"
	@echo "  make lint       - Executa lint"
	@echo "  make test       - Executa testes"
	@echo "  make build      - Gera build"
	@echo "  make shell      - Acessa shell"
	@echo ""
