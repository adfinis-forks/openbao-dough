# OpenBao Dough - Development Makefile

# Configuration
OPENBAO_ADDR ?= http://127.0.0.1:8200
OPENBAO_TOKEN ?= myroot

# Default target
.DEFAULT_GOAL := help

## help: Show this help message
.PHONY: help
help:
	@echo "OpenBao Dough Development Commands"
	@echo "================================="
	@echo ""
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/ /'

## dev: Start development server
.PHONY: dev
dev:
	npm run dev

## build: Build the application
.PHONY: build
build:
	npm run build

## check: Run code quality checks
.PHONY: check
check:
	npm run check

## format: Format code
.PHONY: format
format:
	npm run format

## spec: Generate OpenAPI specification from running OpenBao instance
.PHONY: spec
spec:
	@echo "🔄 Generating OpenAPI spec from OpenBao..."
	@./scripts/generate-openapi-spec.sh "$(OPENBAO_ADDR)" "$(OPENBAO_TOKEN)"

## codegen: Generate TypeScript client from OpenAPI spec
.PHONY: codegen
codegen:
	@echo "🔄 Generating TypeScript client with @hey-api/openapi-ts..."
	pnpm openapi-ts

## regen: Regenerate both spec and client (full refresh)
.PHONY: regen
spec-regen: spec codegen
	@echo "🎉 Full regeneration complete!"