import { image, Rank, Tensor, TypedArray } from "@tensorflow/tfjs";
import { isTypedArray } from "util/types";

const MIN_SINGLE_RESULT_LENGTH = 6; // this is minimum, x,y,w,h,score,classScore(s)
const MAX_NUM_OF_RESULTS = 6300;

const MAX_NONMAX_SUPRESS_RESULTS = 1000; // some random number at the moment

type Coords = [number, number, number, number];
type ReshapedOutput = {
  boxes: number[][] | TypedArray[];
  scores: number[] | TypedArray;
  validDetections: number;
};

/**
 * Reshape YOLO x,y,w,h coordinates into BoundingBox coordinates (x1,y1,x2,y2)
 *
 * @returns BoundingBox coordinates [x1,y1,x2,y2]
 */
function xywh2xyxy(x: number, y: number, w: number, h: number): Coords {
  const wHalf = w / 2;
  const hHalf = h / 2;
  return [x - wHalf, y - hHalf, x + wHalf, y + hHalf];
}

/**
 * This should be called if tensorflow function `executeAsync` returns single result
 * instead of array of results
 *
 * @param tensorRank result of model.executeAsync()
 */
export async function reshapeTensorSingleOutput(
  tensorRank: Tensor<Rank>,
  minScore: number
): Promise<ReshapedOutput> {
  console.debug("Reshaping SINGLE Tensor output");

  const numOfResults = tensorRank.shape[1] || MAX_NUM_OF_RESULTS;
  const resultLength = tensorRank.shape[2] || MIN_SINGLE_RESULT_LENGTH;
  // SingleResultLength: min is 6 if number of model classes is 1
  // - first 4 numbers are coordinates
  // - 5th number is box confidence (score)
  // - 6th to singleResultLength(th) are classes confidences

  // Get Data
  const resultRaw = await tensorRank.data();

  // Split 1D array into 3 arrays
  const coordsYoloAll = [];
  const boxScoresAll = [];
  const classScoresAll = [];

  for (let row = 0; row < numOfResults; row += 1) {
    const singleResult = resultRaw.slice(
      row * resultLength,
      row * resultLength + resultLength
    );

    const rowCoords = singleResult.slice(0, 4);
    const rowBoxProb = singleResult[4];
    const rowClassProb = singleResult
      .slice(5, resultLength)
      .map((v) => v * rowBoxProb);

    if (rowBoxProb > minScore) {
      coordsYoloAll.push(rowCoords);
      boxScoresAll.push(rowBoxProb);
      classScoresAll.push(rowClassProb[0]); // TODO: // getMaxProbClasses + addConstantToFileteredBoxes should be maybe called
    }
  }

  // convert YOLO coords into BoundingBoxes
  const coordsBoundBoxesAll = coordsYoloAll.map((c) =>
    xywh2xyxy(c[0], c[1], c[2], c[3])
  );

  // excute NonMaxSuppresion
  const nonMaxIndexes = await image.nonMaxSuppressionAsync(
    coordsBoundBoxesAll,
    classScoresAll,
    MAX_NONMAX_SUPRESS_RESULTS
  );
  const nonMaxIndexesData = await nonMaxIndexes.data();

  // nonMaxIndexes.data();

  // prepare final results
  const boxes = [];
  const boxScores = [];
  const classScores = [];

  for (const foundIndex of nonMaxIndexesData) {
    boxes.push(coordsBoundBoxesAll[foundIndex]);
    boxScores.push(boxScoresAll[foundIndex]);
    classScores.push(classScoresAll[foundIndex]);
  }

  return {
    boxes,
    // boxScores,
    scores: classScores,
    validDetections: boxes.length,
  };
}

/**
 * This should be called if tensorflow function `executeAsync` returns array of results
 *
 * @param tensorRank result of model.executeAsync()
 */
export async function reshapeTensorArrayOutput(
  tensorRanks: Tensor<Rank>[],
  minScoreIgnored: number
) {
  // :Promise<ReshapedOutput>
  console.debug("Reshaping ARRAY Tensor output");
  const [boxesTensor, scoresTensor, _classesTensor, validDetectionsTensor] =
    tensorRanks;

  // console.log(boxesTensor, scoresTensor, classesTensor, validDetectionsTensor);

  // const validDetections = validDetectionsTensor.dataSync()[0];
  // const boxes1d = boxesTensor.dataSync().slice(0, validDetections * 4);
  // const scores = scoresTensor.dataSync().slice(0, validDetections);
  // const classes = classesTensor.dataSync().slice(0, validDetections);

  const [validDetections, boxes1d, scores] = await Promise.all([
    validDetectionsTensor.data(),
    boxesTensor.data(),
    scoresTensor.data(),
  ]);
  // const validDetections = validDetectionsTensor.dataSync()[0];
  // const boxes1d = boxesTensor.dataSync().slice(0, validDetections * 4);
  // const scores = scoresTensor.dataSync().slice(0, validDetections);

  console.log(validDetections, boxes1d, scores);

  // const boxes = [];

  // for (let row = 0; row < validDetections; row += 1) {
  //   const boundingBox = boxes1d.slice(row * 4, row * 4 + 4);
  //   boxes.push(boundingBox);
  // }

  return {
    boxes: boxesTensor,
    validDetections,
    scores,
  };
}
