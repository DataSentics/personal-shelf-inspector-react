[![Azure Static Web Apps CI/CD](https://github.com/DataSentics/personal-shelf-inspector-react/actions/workflows/azure-static-web-apps-icy-glacier-028ce5a03.yml/badge.svg)](https://github.com/DataSentics/personal-shelf-inspector-react/actions/workflows/azure-static-web-apps-icy-glacier-028ce5a03.yml)

# Personal Shelf Inspector

WebApp to help people with impaired vision to recognize and read products' pricetags in shops

## Online demo

[https://personal.shelfinspector.com](https://personal.shelfinspector.com)

## About

It uses ML models to recognize pricetags and and its' parts and then OCR to read them.
This is MVP. Feel free to contact us if you'd like to contribute.

## Tech

- React + PWA configuration
- [Chakra-UI](https://ux.stackexchange.com/a/125701) - GUI
- [tensorflow.js](https://www.tensorflow.org/js) - locating pricetags
- [tesseract.js](https://github.com/naptha/tesseract.js/) - OCR

## How it works

1. User should take photo of shelves with pricetags in shop (user should try to take sharp photo with good quality)
2. Photo goes through [pricetag model](public/web_models/names_and_prices/model.json) and pricetags are located in original photo
3. Collage image with found and cropped pricetags is created
4. Collage image goes through [names&prices model](public/web_models/names_and_prices/model.json) to detect location of product name and price
5. Then those location are are read with tesseract.js
6. Results are displayed with correct [ARIA roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles) so it can be connected with mobile `TalkBack` and read to person with impaired vision

### Additional info, settings and debugging

#### PWA

This webapp is created as PWA so it can be started in offline mode. To accomplish that some `tesseract.js` source files had to be included in [public/tesseract folder](public/tesseract/). This was inspired by [tesseract.js-offline repo](https://github.com/jeromewu/tesseract.js-offline/). Also you can run command `make copy-tesseract` to update tessract offline source files.

#### Settings

In footer is link to settings where can be found some settings mostly for debugging purposes.

## Development

### Basic commands

```bash
# help
make

# start local development server
make dev
```

### How to update

- Some configs are hardcoded and can be found in [src/\_constants/index.ts](src/_constants/index.ts)
- models: can be simply replaced in their location
- tesseract: latest scripts can be rewritten with `make copy-tesseract` command
- CICD via [GitHub Actions](.github/workflows/azure-static-web-apps-icy-glacier-028ce5a03.yml) when pushed to branch `main`

## Need to be fixed

- sorting products correctly into shelf. WIP can be found under `feat/sort_to_shelves` branch. It's copied and updated from `personal-shelf-native` app. Should be probbaly refuctored & fixed. Now it's randomly sorted
  - this code was heavily inspired from original ReactNative app for PersonalShelfInspector (so there you can see original code)
  - now it's completely done in function `guessShelves()` which at the end calls function `quessShelvesMocking()` so it's sorting randomly (so it at least looks somehow usable in GUI). At the end function should add `shelfRank` property and based on this it should sort products. So either I copied code incorrectly, or it's working but I didn't understand purpose of this `shelfRank` variable. Maybe it would be worth to compare output of Native app and after that fix it.

## What can be improved in the future

- [service-worker](src/service-worker.ts) caching of ML and Tesseract resources on line 75. At the moment it's just basic configuration and could be improved
- service worker - in [general caching](https://create-react-app.dev/docs/making-a-progressive-web-app/) and ensuring user has latest version available
- whole line of product name with price could be read together with mobile [TalkBack](https://support.google.com/accessibility/android/answer/6007100?hl=en)
  - even [non-standard role](https://ux.stackexchange.com/a/125701) `text` didn't help
- algorithm to sharpen photo before OCR
- reducing colors in images for OCR
- running OCR with [multiple workers](https://github.com/naptha/tesseract.js/blob/master/docs/examples.md#with-multiple-workers-to-speed-up)
- footer sometimes doesn't render perfectly when debug canvas are rendered or with variable URL bar in browser
- bug: when in development mode with Hot-Reload and OCR is executed again, somehow pricetags and their values can be mixed betweent themselves
