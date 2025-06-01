# Hono Docker Development Commands
# ====================================

# Default environment variables
PORT ?= 3000
ENV ?= dev

.PHONY: help dev prod-dist prod-binary build clean logs restart stop compare

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start development server with hot reload
	docker compose --env-file .env.dev up dev --remove-orphans

prod-dist: ## Start production server using dist build
	docker compose --env-file .env.prod up --build -d prod-dist --remove-orphans

prod-binary: ## Start production server using compiled binary
	COMPOSE_BAKE=true docker compose --env-file .env.prod up --build -d prod-binary --remove-orphans

build: ## Build all Docker images
	docker compose build

clean: ## Remove all containers, images, and volumes
	docker compose down --rmi all --volumes --remove-orphans

logs: ## View logs for all containers
	docker compose logs -f

restart: ## Restart all containers
	docker compose restart

stop: ## Stop all containers
	docker compose stop

compare: ## Compare build and runtime performance between dist and binary
	./scripts/compare_builds.sh

# Default target
.DEFAULT_GOAL := help
