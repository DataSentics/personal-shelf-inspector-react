import {
  browser,
  GraphModel,
  image,
  Rank,
  Tensor,
  tidy,
  TypedArray,
} from "@tensorflow/tfjs";
import { Boxes } from "_types";

export type ReshapedOutput = {
  boxes: Boxes;
  scores: TypedArray | number[];
  classes: TypedArray | number[];
  validDetections: number;
};

/**
 * Reshapre 1d array into 2d array with # elems per row
 */
function array1dTo2d(
  array1d: Float32Array | Int32Array | Uint8Array,
  elemsPerRow = 4
): (Float32Array | Int32Array | Uint8Array)[] {
  // const arr1dFixed = array1d.at()
  const length = array1d.length;
  let newLength = length / elemsPerRow;
  if (newLength % 1 !== 0)
    console.warn(
      `array1dTo2d: Given array length '${length}' is not multiple of parameter elemsPerRow=${elemsPerRow}`
    );
  newLength = Math.ceil(newLength);

  const result2dArray = [];
  for (let row = 0; row < newLength; row += 1) {
    result2dArray.push(
      array1d.slice(row * elemsPerRow, row * elemsPerRow + elemsPerRow)
    );
  }

  return result2dArray;
}

/**
 * This should be called if tensorflow function `executeAsync` returns array of results
 *
 * @param tensorRank result of model.executeAsync()
 */
export async function reshapeTensorArrayOutput(
  tensorRanks: Tensor<Rank>[]
  // _minScoreIgnored: number // TODO: this should be used
): Promise<ReshapedOutput> {
  console.debug("Reshaping ARRAY Tensor output");
  const [boxesTensor, scoresTensor, classesTensor, validDetectionsTensor] =
    tensorRanks;

  const [boxes1dResult, scoresResult, classesResult, validDetectionsResult] =
    await Promise.all([
      boxesTensor.data(),
      scoresTensor.data(),
      classesTensor.data(),
      validDetectionsTensor.data(),
    ]);
  const validDetections = validDetectionsResult[0];
  const boxes1d = boxes1dResult.slice(0, validDetections * 4);
  const scores = scoresResult.slice(0, validDetections);
  const classes = classesResult.slice(0, validDetections);

  const boxes = array1dTo2d(boxes1d, 4);

  return {
    boxes,
    validDetections,
    scores,
    classes,
  };
}

export const tensorFromCanvas = (
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

export const getModelSize = (
  model: GraphModel
  // backupDefaultSize: number
): [number, number] | undefined => {
  // backupDefaultSize is used if model doesn't contain this info. This shouldn't
  // happen, but typescript would be unhappy otherwise
  // const BDS = backupDefaultSize;
  return (model.inputs[0].shape?.slice(1, 3) as [number, number]) || undefined;
};

/**
 * Main function for executing models on image(html canvas)
 *
 * @param model
 * @param canvas
 * @param minScore
 */
export const executeImageModel = async (
  model: GraphModel,
  canvas: HTMLCanvasElement
): Promise<ReshapedOutput> => {
  // const canvW
  const backupSize = [canvas.width, canvas.width];
  const [modelWidth, modelHeight] = getModelSize(model) || backupSize;

  const tensor = tensorFromCanvas(canvas, modelWidth, modelHeight);

  const execStart = performance.now();
  const tensorResult = await model.executeAsync(tensor);
  const execEnd = performance.now();

  console.log(
    model["modelUrl"].split("/").slice(-2).join("/") +
      ` executed in ${Math.round(execEnd - execStart)} ms`
  );

  if (!Array.isArray(tensorResult)) {
    console.error("tensorResult:", tensorResult);
    throw new Error(
      "Ouput in 'tensorResult' variable should be array. " +
        "This is probably because old model (YOLO) is used"
    );
  }

  const result = await reshapeTensorArrayOutput(tensorResult);

  return result;
};

/**
 * Convert YOLO x,y,w,h coordinates into BoundingBox coordinates (x1,y1,x2,y2)
 *
 * @returns BoundingBox coordinates [x1,y1,x2,y2]
 */
// function xywh2xyxy(x: number, y: number, w: number, h: number): BoxCoords {
//   const wHalf = w / 2;
//   const hHalf = h / 2;
//   return [x - wHalf, y - hHalf, x + wHalf, y + hHalf];
// }
