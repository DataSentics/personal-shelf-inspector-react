// import { GraphModel } from "@tensorflow/tfjs";

import {
  browser,
  GraphModel,
  image,
  Rank,
  reshape,
  Tensor,
  tidy,
} from "@tensorflow/tfjs";
import {
  CANVAS_BG_COLOR,
  CANVAS_FONT,
  CANVAS_FONT_COLOR,
  CANVAS_LINE_WIDTH,
  CANVAS_STROKE_COLOR,
} from "_constants";
import { isValidText } from "./other";
import { reshapeTensorArrayOutput, reshapeTensorSingleOutput } from "./tensor";

// const CANVAS_BG_COLOR = "#000000";
// const CANVAS_FONT = "16px sans-serif";

const cropImageToCanvas = (
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => {
  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;
  console.log("image", image);

  // canvas.width = image.width;
  // canvas.height = image.height;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = CANVAS_BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const ratio = Math.min(
    canvas.width / image.naturalWidth,
    canvas.height / image.naturalHeight
  );
  const newWidth = Math.round(naturalWidth * ratio);
  const newHeight = Math.round(naturalHeight * ratio);
  ctx.drawImage(
    image,
    0,
    0,
    naturalWidth,
    naturalHeight,
    (canvas.width - newWidth) / 2,
    (canvas.height - newHeight) / 2,
    // 0,
    // 0,
    newWidth,
    newHeight
  );
};

// const cropToCanvasPricetag = (
//   image: EventTarget & HTMLImageElement,
//   canvas: HTMLCanvasElement,
//   ctx: CanvasRenderingContext2D,
//   [tagX1, tagY1, tagX2, tagY2]: [number, number, number, number]
// ) => {
//   console.log("image-pricetag", image, tagX1, tagY1, tagX2, tagY2);
//   console.log(image.naturalWidth, image.naturalHeight);

//   // const naturalWidth = image.naturalWidth;
//   // const naturalHeight = image.naturalHeight;

//   // const tagWidth = pricetagCoords[2] - pricetagCoords[0];
//   // const tagHeight = pricetagCoords[3] - pricetagCoords[1];
//   const tagWidth = tagX2 - tagX1;
//   const tagHeight = tagY2 - tagY1;

//   // canvas.width = image.width;
//   // canvas.height = image.height;

//   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//   ctx.fillStyle = CANVAS_BG_COLOR;
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
//   const ratio = Math.min(canvas.width / tagWidth, canvas.height / tagHeight);

//   console.log(tagWidth, tagHeight, ratio);

//   const imgSize = Math.max(image.naturalWidth, image.naturalHeight);

//   console.log(
//     "cropToCanvasPricetag",
//     tagX1 * 1000,
//     tagY1 * 1000,
//     tagWidth * 1000,
//     tagHeight * 1000,
//     0,
//     0,
//     canvas.width,
//     canvas.height
//   );

//   const naturWidth = image.naturalWidth;
//   const naturHeight = image.naturalHeight;

//   // const newWidth = Math.round(naturalWidth * ratio);
//   // const newHeight = Math.round(naturalHeight * ratio);
//   ctx.drawImage(
//     image,
//     tagX1 * naturWidth,
//     tagY1 * naturWidth - (naturWidth - naturHeight) / 2,
//     tagWidth * naturWidth,
//     tagHeight * naturWidth,
//     // 200,
//     0,
//     0,
//     canvas.width,
//     canvas.height
//     // (canvas.width - newWidth) / 2,
//     // (canvas.height - newHeight) / 2,
//     // newWidth,
//     // newHeight
//   );
// };

const tensorFromCanvas = (
  canvas: HTMLCanvasElement,
  modelWidth: number,
  modelHeight: number
) =>
  tidy(() =>
    image
      .resizeBilinear(browser.fromPixels(canvas), [modelWidth, modelHeight])
      .div(255.0)
      .expandDims(0)
  );

const getModelSize = (
  model: GraphModel,
  backupDefaultSize: number
): [number, number] => {
  // backupDefaultSize is used if model doesn't contain this info. This shouldn't
  // happen, but typescript would be unhappy otherwise
  const BDS = backupDefaultSize;
  return (model.inputs[0].shape?.slice(1, 3) as [number, number]) || [BDS, BDS];
};

/**
 * Main function for executing models on image(html canvas)
 *
 * @param model
 * @param canvas
 * @param minScore
 */
const executeImageModel = async (
  model: GraphModel,
  canvas: HTMLCanvasElement,
  minScore = 0
) => {
  const [modelWidth, modelHeight] = getModelSize(model, canvas.width);
  // console.log("canvas.width", canvas.width);

  const tensor = tensorFromCanvas(canvas, modelWidth, modelHeight);
  const tensorResult = await model.executeAsync(tensor);

  const { boxes, scores, validDetections } = Array.isArray(tensorResult)
    ? await reshapeTensorArrayOutput(tensorResult)
    : await reshapeTensorSingleOutput(tensorResult, minScore);

  console.log(boxes, scores, validDetections);

  return { boxes, scores, validDetections };
};

/**
 * Draw bounding boxes over canvas. Not used function, kept just for debugging
 * @param tensorRanks
 * @param canvas
 * @param ctx
 * @returns
 */
const drawPredictions = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  boxes: (Float32Array | Int32Array | Uint8Array | number[])[],
  boxesLabels: Float32Array | Int32Array | Uint8Array | number[] | string[]
  // validDetections: number
): void => {
  ctx.strokeStyle = CANVAS_STROKE_COLOR;
  ctx.lineWidth = CANVAS_LINE_WIDTH;
  ctx.fillStyle = CANVAS_STROKE_COLOR;
  ctx.textBaseline = "top";
  // const FONT = "16px sans-serif";

  boxes.forEach((coords, boxIndex) => {
    const [x1, y1, x2, y2] = coords;
    const canX1 = x1 * canvas.width;
    const canX2 = x2 * canvas.width;
    const canY1 = y1 * canvas.height;
    const canY2 = y2 * canvas.height;
    const width = canX2 - canX1;
    const height = canY2 - canY1;

    // Draw the bounding box.
    ctx.strokeRect(canX1, canY1, width, height);

    const label = boxesLabels[boxIndex];
    // Draw the label backgroud, if label exists
    if (isValidText(label)) {
      const textWidth = ctx.measureText(label.toString()).width;
      const textHeight = parseInt(CANVAS_FONT, 10); // base 10
      const CLW = CANVAS_LINE_WIDTH;

      // ctx.fillStyle = CANVAS_STROKE_COLOR;

      ctx.fillRect(canX1, canY1, textWidth + CLW, textHeight + CLW);
    }
  });

  // Draw texts last to ensure they're on top
  ctx.fillStyle = CANVAS_FONT_COLOR;
  boxesLabels.forEach((label, boxIndex) => {
    if (!isValidText(label)) return;

    const [x1, y1] = boxes[boxIndex];
    const canX1 = x1 * canvas.width;
    const canY1 = y1 * canvas.height;

    ctx.fillText(label.toString(), canX1, canY1 + CANVAS_LINE_WIDTH);
  });

};

// export const x = 1;
export {
  tensorFromCanvas,
  cropImageToCanvas,
  drawPredictions,
  executeImageModel,
};
