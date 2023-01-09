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
import { reshapeTensorArrayOutput, reshapeTensorSingleOutput } from "./tensor";

const CANVAS_BG_COLOR = "#000000";
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
  console.log("canvas.width", canvas.width);

  const tensor = tensorFromCanvas(canvas, modelWidth, modelHeight);
  const tensorResult = await model.executeAsync(tensor);

  console.log("tensorResult", tensorResult);

  // const { boxes, scores, validDetections }
  const a = Array.isArray(tensorResult)
    ? reshapeTensorArrayOutput(tensorResult, minScore)
    : await reshapeTensorSingleOutput(tensorResult, minScore);
  // console.log(boxes, scores, validDetections);
  console.log(a);
};

/**
 * Draw bounding boxes over canvas. Not used function, kept just for debugging
 * @param tensorRanks
 * @param canvas
 * @param ctx
 * @returns
 */
const drawPredictions = (
  tensorRanks: Tensor<Rank>[] | Tensor<Rank>,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): void => {
  // const font = "16px sans-serif";
  // ctx.font = font;
  // ctx.textBaseline = "top";
  console.log("tensorRanks", tensorRanks);

  if (!Array.isArray(tensorRanks)) {
    console.error("TensorRanks has to be array");
    console.error(tensorRanks);
    return;
  }
  const [boxes, scores, classes, validDetections] = tensorRanks;
  const boxes_data = boxes.dataSync();
  // const scores_data = scores.dataSync();
  // const classes_data = classes.dataSync();
  const valid_detectionsData = validDetections.dataSync()[0];

  ctx.strokeStyle = "#00FFFF";
  ctx.lineWidth = 4;

  for (let i = 0; i < valid_detectionsData; ++i) {
    const [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
    const canX1 = x1 * canvas.width;
    const canX2 = x2 * canvas.width;
    const canY1 = y1 * canvas.height;
    const canY2 = y2 * canvas.height;
    const width = canX2 - canX1;
    const height = canY2 - canY1;
    // const klass = names[classes_data[i]];
    // const score = scores_data[i].toFixed(2);
    ctx.strokeRect(canX1, canY1, width, height);
  }

  // Draw the bounding box.
};

// export const x = 1;
export {
  tensorFromCanvas,
  cropImageToCanvas,
  drawPredictions,
  executeImageModel,
};
