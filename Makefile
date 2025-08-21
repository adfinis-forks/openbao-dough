# OpenBao Dough - Development Makefile

# Configuration
OPENBAO_ADDR ?= http://127.0.0.1:8200
OPENBAO_TOKEN ?= 
SPEC_FILE = api/oapi.yaml
TYPES_FILE = src/types/api.ts

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

## codegen: Generate TypeScript types from OpenAPI spec
.PHONY: codegen
codegen:
	@if [ ! -f "$(SPEC_FILE)" ]; then \
		echo "❌ OpenAPI spec not found at $(SPEC_FILE)"; \
		echo "   Run 'make spec' first to generate it"; \
		exit 1; \
	fi
	@echo "🔄 Generating TypeScript types..."
	npm run codegen
	@echo "✅ TypeScript types generated at $(TYPES_FILE)"

## regen: Regenerate both spec and types (full refresh)
.PHONY: regen
regen: spec codegen
	@echo "🎉 Full regeneration complete!"