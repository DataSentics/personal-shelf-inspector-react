import { getPointX, LinePoints, Point, PointBase } from "./objects";
import { sortBy } from "./other";

function getAngle(p1: PointBase, p2: PointBase): number {
  const slope = (p2.y - p1.y) / (p2.x - p1.x);
  const angle = Math.atan(slope);
  return (angle * 180) / Math.PI;
}

export function findMostCommonAngles(
  points: PointBase[],
  toleranceDegrees: number
): Array<number> {
  const angles: Map<string, number> = new Map();
  const results: Array<number> = [];

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const angleDegrees = getAngle(points[i], points[j]);

      // Use a rounded angle as the key and increment the count
      const roundedAngle =
        Math.round(angleDegrees / toleranceDegrees) * toleranceDegrees;

      angles.set(
        roundedAngle.toString(),
        (angles.get(roundedAngle.toString()) || 0) + 1
      );
    }
  }

  const maxCount = Math.max(...angles.values());

  // Add angles with max count to the results
  for (const [angle, count] of angles.entries()) {
    if (count === maxCount) {
      results.push(Number(angle));
    }
  }

  if (results.length !== 1)
    console.warn(
      `There were ${results.length} angles found.` +
        "There should be only one in majority of cases. n results"
    );

  return results;
}

/**
 * Calculates distance of point from line. Angle is in degrees
 *
 * warning: It doesn't return zero when there is some angle, but number very close to zero
 */
function getLineDistance(
  line: { point: PointBase; angle: number },
  testPoint: PointBase
): number {
  // Convert the angle from degrees to radians
  const radians = line.angle * (Math.PI / 180);

  // Calculate the slope and intercept of the line
  const slope = Math.tan(radians);
  const intercept = line.point.y - slope * line.point.x;

  // Calculate the perpendicular distance from the point to the line
  const distance =
    Math.abs(slope * testPoint.x - testPoint.y + intercept) /
    Math.sqrt(slope * slope + 1);

  return distance;
}

export function separatePointsIntoLines<TPoint extends PointBase>(
  sortedPoints: TPoint[],
  commonAngle: number,
  distanceTolerance: number
): TPoint[][] {
  const lines: TPoint[][] = [];
  let tempPoints = [...sortedPoints].sort(sortBy(getPointX));

  while (tempPoints.length > 0) {
    // const currentLine: LinePoints = [];
    const middlePointIndex = Math.floor(tempPoints.length / 2);
    const basePoint = tempPoints.splice(middlePointIndex, 1)[0];

    // currentLine.push(basePoint);
    const newTempPoints: TPoint[] = [];

    const pointsOnLine = tempPoints.filter((point) => {
      const distance = getLineDistance(
        { point: basePoint, angle: commonAngle },
        point
      );

      if (distance < distanceTolerance) return true;

      newTempPoints.push(point);
      return false;
    });

    const newLine = [basePoint, ...pointsOnLine];
    lines.push(newLine);

    tempPoints = newTempPoints;
  }

  return lines;
}

// export function findCommonLines(
//   points: Array<Point>,
//   toleranceDegrees: number
// ) {
//   const commonAngles = findMostCommonAngles(points, toleranceDegrees);
//   const lines = separatePointsIntoLines(
//     points,
//     commonAngles[0],
//     toleranceDegrees
//   );
//   return lines;
// }

function getIntersectionWithY(
  point1: PointBase,
  point2: PointBase
): number | typeof Infinity {
  if (point1.x === point2.x) return Infinity;

  const m = (point2.y - point1.y) / (point2.x - point1.x);
  const y = point1.y - m * point1.x;

  return y;
  // return new Point(0, y);
}

export function getIntersectionWithYFromLine(points: LinePoints) {
  // const yIntersections = lines.map((line) => {
  const [point1, point2] = points;
  if (points.length === 0) return Infinity;
  if (points.length === 1) return point1.y;

  return getIntersectionWithY(point1, point2);
}

// Sort lines array by values from yIntersections
//   return [...lines].sort(
//     (a, b) =>
//       yIntersections[lines.indexOf(a)] - yIntersections[lines.indexOf(b)]
//   );
// }
