enum MODEL_SIZES {
  "S_320" = 320,
  "S_640" = 640,
}

// PriceTagModel

export const MODEL_PRICETAG_SIZE = MODEL_SIZES.S_640;
export const MODEL_PRICETAG_PATH = "/web_models/pricetags/model.json"; // size=640
// export const MODEL_PRICETAG_SIZE = MODEL_SIZES.S_320;
// export const MODEL_PRICETAG_PATH = "/web_models/pricetagsFromNative/model.json"; // size=320
export const MODEL_PRICETAG_MIN_SCORE = 0.25;

// NamesAndPricesModel
// export const MODEL_NAME_PRICE_SIZE = MODEL_SIZES.S_320;
