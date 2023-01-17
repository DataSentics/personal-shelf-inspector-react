import { Rank, Tensor } from "@tensorflow/tfjs";
import { RectCoords, Roi } from "./shelvesOperations";

export function tensorsToRois(tensorRanks: Array<Tensor<Rank>>): Array<Roi> {
  //   if (Array.isArray(tensorRanks)) {
  const [boxesTensor, scoresTensor, _classesTensor, validDetectionsTensor] =
    tensorRanks;
  const validDetections = validDetectionsTensor.dataSync()[0];
  const validBoxes = boxesTensor.dataSync().slice(0, validDetections * 4);
  const validScores = scoresTensor.dataSync().slice(0, validDetections);

  const roiList: Roi[] = [];

  for (let i = 0; i < validDetections; i += 1) {
    const cordArr = validBoxes.slice(i * 4, i * 4 + 4);
    const coords: RectCoords = [cordArr[0], cordArr[1], cordArr[2], cordArr[3]];
    const score = validScores[i];
    roiList.push({ coords, score });
  }
  return roiList;
}

export function normalizeRoiCoords(roi: Roi, ratio: number): Roi {
  const coords = roi.coords.map((x) => x * ratio);
  return { ...roi, coords };
}

export const a = 1;
