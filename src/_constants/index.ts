// === Model sizes ===
enum MODEL_SIZES {
  "S_320" = 320,
  "S_640" = 640,
}

// === PriceTagModel ===
export const MODEL_PRICETAG_SIZE = MODEL_SIZES.S_640;
export const MODEL_PRICETAG_PATH = "/web_models/pricetags/model.json"; // size=640
// export const MODEL_PRICETAG_SIZE = MODEL_SIZES.S_320;
// export const MODEL_PRICETAG_PATH = "/web_models/pricetagsFromNative/model.json"; // size=320
// export const MODEL_PRICETAG_MIN_SCORE = 0.25;

// === NamesAndPricesModel ===
export const MODEL_NAME_PRICE_SIZE = MODEL_SIZES.S_640;
export const MODEL_NAME_PRICE_PATH = "/web_models/names_and_prices/model.json"; // size=640

// === Canvas ===
export const CANVAS_BG_COLOR = "#000000";
export const CANVAS_STROKE_COLOR = "#00FFFF";
export const CANVAS_LINE_WIDTH = 4;
export const CANVAS_FONT = "14px sans-serif";
export const CANVAS_FONT_COLOR = "#000000";
