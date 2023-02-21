type ProdCoords = {
  x: number;
  y: number;
};
type Point = { x: number; y: number };

const products: Point[] = [
  { x: 2287, y: 1751 },
  { x: 1698, y: 1744 },
  { x: 1586, y: 908 },
  { x: 3514, y: 1772 },
  { x: 2742, y: 1758 },
  { x: 1254, y: 1750 },
  { x: 2439, y: 912 },
  { x: 3403, y: 906 },
  { x: 218, y: 898 },
  { x: 1253, y: 2679 },
  { x: 2249, y: 2681 },
  { x: 362, y: 1743 },
  { x: 666, y: 902 },
  { x: 3433, y: 2695 },
];

const productsAngled: Point[] = [
  { x: 2371, y: 3350 },
  { x: 3180, y: 2675 },
  { x: 3780, y: 2096 },
  { x: 14, y: 2614 },
  { x: 1972, y: 3251 },
  { x: 953, y: 2138 },
  { x: 1987, y: 2382 },
  { x: 3575, y: 2772 },
  { x: 1423, y: 2238 },
  { x: 630, y: 2917 },
  { x: 2085, y: 1689 },
  { x: 2620, y: 1811 },
  { x: 2655, y: 3419 },
  { x: 3410, y: 3579 },
  { x: 2578, y: 2539 },
  { x: 3191, y: 1947 },
  { x: 346, y: 2000 },
  { x: 2830, y: 2591 },
  { x: 1759, y: 1611 },
  { x: 119, y: 1945 },
  { x: 381, y: 1265 },
  { x: 1391, y: 1512 },
  { x: 1276, y: 3075 },
  { x: 940, y: 1405 },
  { x: 2480, y: 1407 },
];

// type Point = { x: number; y: number };

function findAngleBetweenPoints(p1: Point, p2: Point): number {
  const slope = (p2.y - p1.y) / (p2.x - p1.x);
  const angle = Math.atan(slope);
  return (angle * 180) / Math.PI;
}

console.log(findAngleBetweenPoints(products[0], products[1]));
console.log(findAngleBetweenPoints(products[1], products[0]));
console.log(findAngleBetweenPoints(products[1], products[3]));
console.log(findAngleBetweenPoints(products[3], products[0]));
console.log(findAngleBetweenPoints({ x: 1, y: 1 }, { x: 0, y: 2 }));

function sortByX(products: ProdCoords[]) {
  return [...products].sort((pr1, pr2) => pr1.x - pr2.x);
}

const getAngle = findAngleBetweenPoints;

function findMostCommonAngles(
  points: Point[],
  toleranceDegrees: number
): Array<number> {
  const angles: Map<string, number> = new Map();
  const results: Array<number> = [];

  //   let debugAngles: number[] = [];

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

  // Find the max count
  let maxCount = 0;
  for (const count of angles.values()) {
    if (count > maxCount) {
      maxCount = count;
    }
  }

  // Add angles with max count to the results
  for (const [angle, count] of angles.entries()) {
    if (count === maxCount) {
      results.push(Number(angle));
    }
  }

  return results;
}

console.log(findMostCommonAngles(sortByX(productsAngled), 3)[0]);
console.log(findMostCommonAngles(sortByX(products), 3));
console.log(findMostCommonAngles(products, 3));
console.log(findMostCommonAngles([products[0], products[1], products[3]], 3));

const a = [5, 12, 7, 3, 7, 8, 2];

const b = a.sort((x, y) => x - y);

a;
b;

// function getAngle(p1: Point, p2: Point): number {
//   return Math.atan2(p2.y - p1.y, p2.x - p1.x);
// }

type Line = Array<Point>;

function separatePointsIntoLines(
  points: Point[],
  commonAngle: number,
  toleranceDegrees: number
): Array<Array<Point>> {
  const lines: Array<Line> = [];
  let tempPoints = [...points];

  while (tempPoints.length > 0) {
    const line: Line = [];
    const [basePoint, ...rest] = tempPoints;

    line.push(basePoint);

    const notFoundYetPoints = rest.filter((point) => {
      const angle = getAngle(point, basePoint);
      const isSimilarAngle = Math.abs(angle - commonAngle) < toleranceDegrees;

      if (isSimilarAngle) {
        line.push(point);
        return false;
      }

      return true;
    });

    lines.push(line);
    tempPoints = notFoundYetPoints;
  }

  return lines;
}

function findCommonLines(points: Array<Point>, toleranceDegrees: number) {
  const commonAngles = findMostCommonAngles(points, toleranceDegrees);
  const lines = separatePointsIntoLines(
    points,
    commonAngles[0],
    toleranceDegrees
  );
  return lines;
}

const separ = separatePointsIntoLines(products, 0, 5);

console.log(separ[0]);
console.log(separ.length);

const randomNums = [1, 4, 12, 0, 13, -4, 90, 5, 4];
console.log(randomNums.filter((x) => x > 10));
randomNums;

console.log(Math.abs(12));
console.log(findCommonLines(productsAngled, 7).length);

// New stuff

function isPointOnLine(
  basePoint: Point,
  angle: number,
  testPoint: Point,
  tolerance = 0
): boolean | number {
  // Calculate the slope and intercept of the line
  const { x, y } = basePoint;
  const slope = Math.tan(angle);
  const intercept = y - slope * x;

  // Calculate the perpendicular distance from the point to the line
  const { x: x0, y: y0 } = testPoint;
  const distance =
    Math.abs(slope * x0 - y0 + intercept) / Math.sqrt(slope * slope + 1);

  // Return whether the point is on the line or within the tolerance
  // return distance <= tolerance;

  return distance;
}

function isPointOnLine2(
  point: Point,
  angle: number,
  testPoint: Point,
  tolerance = 0
): number {
  // Convert the angle from degrees to radians
  const radians = angle * (Math.PI / 180);

  // Calculate the slope and intercept of the line
  const slope = Math.tan(radians);
  const intercept = point.y - slope * point.x;

  // Calculate the perpendicular distance from the point to the line
  const distance =
    Math.abs(slope * testPoint.x - testPoint.y + intercept) /
    Math.sqrt(slope * slope + 1);

  // Return whether the point is on the line or within the tolerance
  // return distance <= tolerance;
  return distance;
}

// type Point = { x: number; y: number };

// function to round number to given decimals
function round(num: number, decimals: number) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

console.log(round(0.000050003253424, 10));

function isPointOnLine3(
  point: Point,
  angle: number,
  testPoint: Point,
  tolerance = 0
): number {
  // Convert the angle from degrees to radians
  const radians = angle * (Math.PI / 180);

  // Calculate the slope and intercept of the line
  const slope = Math.tan(radians);
  const intercept = point.y - slope * point.x;

  // Calculate the projection of the test point onto the line
  const projectedX =
    (slope * testPoint.y + testPoint.x - slope * intercept) /
    (slope * slope + 1);
  const projectedY = slope * projectedX + intercept;

  // Calculate the distance between the projected point and the test point
  const distance = Math.sqrt(
    (projectedX - testPoint.x) ** 2 + (projectedY - testPoint.y) ** 2
  );

  // Return whether the point is on the line or within the tolerance
  // return distance <= tolerance;
  return distance;
}

const BASE_POINT: Point = { x: 0, y: 0 };
const BASE_ANGLE = 0;
const TEST_POINT: Point = { x: 100, y: 5 / 2 };

console.log(round(isPointOnLine2(BASE_POINT, BASE_ANGLE, TEST_POINT), 10));
console.log(isPointOnLine2(BASE_POINT, BASE_ANGLE, TEST_POINT));

console.log(round(isPointOnLine3(BASE_POINT, BASE_ANGLE, TEST_POINT), 10));
console.log(isPointOnLine3(BASE_POINT, BASE_ANGLE, TEST_POINT));

// const ss = [1,2,3,4,5,6,7]
// console.log();

// class PointCl {
//   x: number;
//   y: number;

//   constructor(x: number, y: number) {
//     this.x = x;
//     this.y = y;
//   }

//   equals(point: Point): boolean {
//     return this.x === point.x && this.y === point.y;
//   }

//   [Symbol.toPrimitive](hint: string): boolean | number {
//     if (hint === 'boolean') {
//       return this.x !== 0 || this.y !== 0;
//     }
//     return this.x + this.y;
//   }
// }

// const p11_0 = new PointCl(1, 2);
// const p11_1 = new PointCl(1, 2);

// console.log(p11_0 === p11_1);
