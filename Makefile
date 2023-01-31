.PHONY: help dev install

# self-documented Makefile
# https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

TESSERACT_PATH := public/tesseract
TESSERACT_LANG_PATH := "$(TESSERACT_PATH)/lang_data"

# IMAGE_NAME := loreal-frontend

dev: ## Start local dev server
	npm start

install: ## Install deps from package.json
	npm i

copy-tesseract: ## Copy latest teseract files to public/scripts folder
	@cp 'node_modules/tesseract.js/dist/worker.min.js' $(TESSERACT_PATH)
	@cp 'node_modules/tesseract.js/dist/worker.min.js.map' $(TESSERACT_PATH)
	@cp 'node_modules/tesseract.js-core/tesseract-core.wasm.js' $(TESSERACT_PATH)
	
	@curl https://github.com/naptha/tessdata/raw/gh-pages/4.0.0/ces.traineddata.gz -LJ --output "$(TESSERACT_LANG_PATH)/ces.traineddata.gz"
	@curl https://github.com/naptha/tessdata/raw/gh-pages/4.0.0/eng.traineddata.gz -LJ --output "$(TESSERACT_LANG_PATH)/eng.traineddata.gz"
