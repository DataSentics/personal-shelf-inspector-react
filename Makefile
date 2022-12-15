.PHONY: help dev install

# self-documented Makefile
# https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# IMAGE_NAME := loreal-frontend

dev: ## Start local dev server
	npm start

install: ## Install deps from package.json
	npm i

# deploy: ## Deploy to google-cloud
# 	@echo -n "Did you build SPA first? [y/N] " && read ans && [ $${ans:-N} = y ]
# 	@echo Deploying to google-cloud
	
# 	gcloud app deploy

