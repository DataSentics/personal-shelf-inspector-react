// import { GraphModel } from "@tensorflow/tfjs";

import { TypedArray } from "@tensorflow/tfjs";
import {
  CANVAS_BG_COLOR,
  CANVAS_FONT,
  CANVAS_FONT_COLOR,
  CANVAS_LINE_WIDTH,
  CANVAS_STROKE_COLOR,
} from "_constants";
import { resizeDimsFit } from "./imageCalcs";
import { BBoxCoords } from "./objects";
import { isValidText } from "./other";

export const drawImageToCanvas = (
  image: HTMLImageElement,
  ctx: CanvasRenderingContext2D
  // resizeMethod: "fit" = "fit" - TODO: in case of future needs
) => {
  const imageWidth = image.naturalWidth;
  console.log("drawImageToCanvas", image.naturalWidth, image.width);

  const imageHeight = image.naturalHeight;
  const canvas = ctx.canvas;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = CANVAS_BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { newWidth, newHeight } = resizeDimsFit(
    [imageWidth, imageHeight],
    [canvas.width, canvas.height]
  );

  ctx.drawImage(
    image,
    0,
    0,
    imageWidth,
    imageHeight,
    0,
    0,
    newWidth,
    newHeight
  );
};

export const drawBoxesToCanvas = (
  sourceImage: HTMLImageElement,
  ctx: CanvasRenderingContext2D,
  boxes: BBoxCoords[],
  collageBoxes: BBoxCoords[]
  // resizeMethod: "fit" = "fit" - TODO: in case of future needs
) => {
  // const imageWidth = image.naturalWidth;
  // const imageHeight = image.naturalHeight;
  // const canvas = ctx.canvas;

  // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // ctx.fillStyle = CANVAS_BG_COLOR;
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  // const { newWidth, newHeight } = resizeDimsFit(
  //   [imageWidth, imageHeight],
  //   [canvas.width, canvas.height]
  // );

  // ctx.drawImage(
  //   image,
  //   0,
  //   0,
  //   imageWidth,
  //   imageHeight,
  //   0,
  //   0,
  //   newWidth,
  //   newHeight
  // );
  const canvas = ctx.canvas;

  ctx.fillStyle = CANVAS_BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // console.log("canvas.width", canvas.width);

  boxes.map((box, boxIndex) => {
    const colagBox = collageBoxes[boxIndex];
    cropBoxToCanvas(sourceImage, ctx, box, colagBox);
  });
};

export const cropBoxToCanvas = (
  image: CanvasImageSource,
  // canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  originalCords: TypedArray | number[],
  newCords: TypedArray | number[]
) => {
  const [x1, y1, x2, y2] = originalCords;
  const [n_x1, n_y1, n_x2, n_y2] = newCords;

  ctx.drawImage(
    image,
    x1,
    y1,
    x2 - x1,
    y2 - y1,
    n_x1,
    n_y1,
    n_x2 - n_x1,
    n_y2 - n_y1
  );
};

/**
 * Draw bounding boxes over canvas. Not used function, kept just for debugging
 * @param tensorRanks
 * @param canvas
 * @param ctx
 * @returns
 */
export const drawPredictions = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  boxes: (Float32Array | Int32Array | Uint8Array | number[])[],
  boxesLabels: Float32Array | Int32Array | Uint8Array | number[] | string[]
  // validDetections: number
): void => {
  const CLW = CANVAS_LINE_WIDTH;

  // prepare canvas properties
  ctx.strokeStyle = CANVAS_STROKE_COLOR;
  ctx.lineWidth = CANVAS_LINE_WIDTH;
  ctx.fillStyle = CANVAS_STROKE_COLOR;
  ctx.textBaseline = "bottom";
  ctx.font = CANVAS_FONT;

  boxes.forEach((coords, boxIndex) => {
    const [x1, y1, x2, y2] = coords;
    const canX1 = x1 * canvas.width;
    const canX2 = x2 * canvas.width;
    const canY1 = y1 * canvas.height;
    const canY2 = y2 * canvas.height;
    const width = canX2 - canX1;
    const height = canY2 - canY1;

    // Draw the bounding boxes
    ctx.strokeRect(canX1, canY1, width, height);

    const label = boxesLabels[boxIndex];
    // Draw the labels' backgrouds, if label exists
    if (isValidText(label)) {
      const textWidth = ctx.measureText(label.toString()).width;
      const textHeight = parseInt(CANVAS_FONT, 10); // base 10

      ctx.fillRect(
        canX1 - CLW / 2,
        canY1 - textHeight,
        textWidth + CLW,
        textHeight
      );
    }
  });

  // Draw texts last to ensure they're on top
  ctx.fillStyle = CANVAS_FONT_COLOR;
  boxes.forEach((coords, boxIndex) => {
    const label = boxesLabels[boxIndex];
    if (!isValidText(label)) return;

    const [x1, y1] = coords;
    const canX1 = x1 * canvas.width;
    const canY1 = y1 * canvas.height;

    ctx.fillText(label.toString(), canX1, canY1 + CANVAS_LINE_WIDTH / 2);
  });
};

/**
 * Takes in a canvas and returns a URL to the image blob.       
 *
 * - result of canvas.toBlob is smaller and should be quicker than toDataURL
 */
async function imageUrlFromCanvas(canvas: HTMLCanvasElement) {
  const imageBlob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve)
  );
  if (!imageBlob) throw new Error("Error creating blob from canvas");
  const imageUrl = URL.createObjectURL(imageBlob);

  return imageUrl;
}

export async function imageElemFromCanvas(canvas: HTMLCanvasElement) {
  const imageUrl = await imageUrlFromCanvas(canvas);

  const imgElement = document.createElement("img");
  imgElement.src = imageUrl;
  await imgElement.decode();

  return imgElement;
}
