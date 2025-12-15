.PHONY: dev prod build stop clean logs help

# ==================== DOCKER ====================

## Inicia desenvolvimento (Docker)
dev:
	docker-compose up dev --build

## Inicia produção (Docker)
prod:
	docker-compose up prod --build -d

## Gera build local
build:
	docker-compose run --rm dev npm run build

## Para containers
stop:
	docker-compose down

## Remove tudo (containers, imagens, volumes)
clean:
	docker-compose down --rmi all --volumes --remove-orphans

## Mostra logs
logs:
	docker-compose logs -f

# ==================== HELP ====================

help:
	@echo ""
	@echo "Comandos disponíveis:"
	@echo ""
	@echo "  make dev    - Inicia desenvolvimento"
	@echo "  make prod   - Inicia produção"
	@echo "  make stop   - Para containers"
	@echo "  make clean  - Remove tudo"
	@echo "  make logs   - Mostra logs"
	@echo ""
