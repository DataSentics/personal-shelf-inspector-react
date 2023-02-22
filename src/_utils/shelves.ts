import {
  FIND_PRICE_TAG_DISTANCE_TOLERANCE_MULTIPLIER,
  FIND_SHELVES_DEGREE_TOLERANCE,
} from "_constants";

import {
  findMostCommonAngles,
  getIntersectionWithYFromLine,
  separatePointsIntoLines,
} from "./geometry";
import type { BBox } from "./objects";
import { getBoxLeftBottom, getPointX } from "./objects";
import { createPairingMap, mean, sortBy } from "./other";

/**
 * Tries to guess shelves number based on horizontal alignment
 * @param products List of products
 */
export const findShelves = (
  bBoxes: BBox[],
  shelvesAngleTolerance = FIND_SHELVES_DEGREE_TOLERANCE,
  distanceToleranceMultiplier = FIND_PRICE_TAG_DISTANCE_TOLERANCE_MULTIPLIER
): BBox[][] => {
  const leftBottomPoints = bBoxes.map(getBoxLeftBottom);

  const pointBBoxPairs = createPairingMap(leftBottomPoints, bBoxes);

  // Find most common angle between price-tags
  const allCommonAngles = findMostCommonAngles(
    leftBottomPoints,
    shelvesAngleTolerance
  );
  console.log(`Most common angle(s) of shelves: ${allCommonAngles}`);
  // We pick first as there should be usually only one most common angle
  const commonAngle = allCommonAngles[0];

  const priceTagHeightMean = Math.round(
    mean(bBoxes.map((bBox) => bBox.height))
  );
  console.log(`Price-tag height mean: ${priceTagHeightMean}`);

  const lines = separatePointsIntoLines(
    leftBottomPoints,
    commonAngle,
    priceTagHeightMean * distanceToleranceMultiplier
  );

  // Sort lines by their intersection with axisY and also all by their coordX
  const bBoxesOnShelves = [...lines]
    .sort(sortBy(getIntersectionWithYFromLine))
    .map((linePoints) => linePoints.sort(sortBy(getPointX)))
    .map((lines) => lines.map((point) => pointBBoxPairs.get(point)));

  return bBoxesOnShelves;
};
