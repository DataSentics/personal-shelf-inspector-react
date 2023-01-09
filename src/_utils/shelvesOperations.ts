import { Product, ProductOnShelf, RectCoords } from "./objects";

// const sortBy;

// type ProductWithQY = {
//   quantiziedY: number;
//   product: Product;
// };

type ProductMetaBase = {
  product: Product;
};

type ProductMeta = ProductMetaBase & {
  quantiziedY: number;
  roiCenter: [number, number];
};

type ProductMetaWithAngle = ProductMeta & {
  angle: number | undefined;
};

type ProductMetaWithAngleAndShelf = ProductMetaWithAngle & {
  shelfRow: number;
};

const SOME_QUANTIZATION_CONSTANT = 3;
const ALLOWED_DEVIATION_FROM_MEDIAN_ANGLE = 0.14; //in radians todo test if some value better
const SHARP_ANGLE_UP = 0.78; //in radians

const mean = (values: number[]): number =>
  values.reduce((a, b) => a + b, 0) / values.length;

/**
 * Sometimes detected pricetags are not sorted left to right correctly in the shelves, when first sorted top to bottom.
 * That may be, because pricetags with similar Y coords end up being detected slightly higher or lower than their neighbours on the shelves.
 * We solve this by quantizing Y coords of the detected pricetags,
 * so we can later sort pricetags with same quantized Y by their X coord value.

 * @param products 
 * @returns List of products with quantizied y1 coord
 */
export const addQuantiziedYCoords = <T extends ProductMetaBase>(
  productMetas: T[]
): Array<T & { quantiziedY: number }> => {
  const boxes = productMetas.map((meta) => meta.product.pricetag.coords);
  const boxesHeights = boxes.map(([_x1, y1, _x2, y2]) => y2 - y1);
  const avarageHeight = mean(boxesHeights);
  const quantizationStepSize = Math.floor(
    avarageHeight / SOME_QUANTIZATION_CONSTANT
  );

  const productsWithQY = productMetas.map((meta) => ({
    ...meta,
    quantiziedY: meta.product.pricetag.coords[1] * quantizationStepSize,
  }));

  return productsWithQY;
};

const getRectCenter = (coords: number[]): [number, number] => {
  const [x1, y1, x2, y2] = coords;
  return [x2 - x1, y2 - y1];
};

export const addPriceTagCenter = <T extends ProductMetaBase>(
  productMetas: T[]
): Array<T & { roiCenter: [number, number] }> => {
  const withCenters = productMetas.map((meta) => {
    const { coords } = meta.product.pricetag;

    return { ...meta, roiCenter: getRectCenter(coords) };
  });

  return withCenters;
};

/**
 * Sorts list of detected pricetags based on their y coord in the original image
 */
export const sortPricetagsTopToBottom = (
  productMetas: ProductMeta[]
): ProductMeta[] =>
  productMetas.sort((a, b) => a.roiCenter[1] - b.roiCenter[1]);

/**
 * Now I have shelve numbers assigned to all products
 * time to sort each shelve left to right
 */
export const sortShelvesLeftToRight = (
  productMetas: ProductMetaWithAngleAndShelf[]
): ProductMetaWithAngleAndShelf[] =>
  productMetas.sort(
    (
      { shelfRow: shelfA, roiCenter: roiA },
      { shelfRow: shelfB, roiCenter: roiB }
    ) => (shelfA === shelfB ? roiA[0] - roiB[0] : shelfA - shelfB)
  );

enum SortDirection {
  LEFT_TO_RIGHT = "leftToRight",
  RIGHT_TO_LEFT = "rightToLeft",
}

/**
 * Input: detected pricetag list sorted by Y coord value.
 * Sort detected pricetag images with the same Y coord (presumably located on the same shelve)
 * LEFT_TO_RIGHT or RIGHT_TO_LEFT by  their X coord
 */
export const sortPricetagsHorizontally = (
  productMetas: ProductMeta[],
  direction: SortDirection = SortDirection.LEFT_TO_RIGHT
): ProductMeta[] => {
  return productMetas.sort(
    (
      { quantiziedY: qyA, roiCenter: roiA },
      { quantiziedY: qyB, roiCenter: roiB }
    ) => {
      if (qyA === qyB) {
        return direction == SortDirection.LEFT_TO_RIGHT
          ? roiA[0] - roiB[0]
          : roiB[0] - roiA[0];
      }
      return qyA - qyB;
    }
  );
};

/**
 * Depending on angle of camera, when capturing image
 * the shelves are usually tilted not perfectly horizontal
 * We want to know if this is LEFT_TO_RIGHT or RIGHT_TO_LEFT ->
 * which side of shelve on the photo has higher y coord value?
 */
export const getShelfSortingDirection = (
  productMetas: ProductMeta[]
): SortDirection => {
  let lefToRigthCount = 0;
  let rightToLeftCount = 0;

  productMetas.forEach(({ roiCenter, quantiziedY }, index, products) => {
    if (index > 0) {
      const currImgCoords = roiCenter;
      const prevImgCoords = products[index - 1].roiCenter;
      currImgCoords[0] > prevImgCoords[0]
        ? (lefToRigthCount += 1)
        : (rightToLeftCount += 1);
    }
  });

  console.log(
    `LEFT_TO_RIGHT ${lefToRigthCount}; RIGHT_TO_LEFT ${rightToLeftCount}`
  );
  return lefToRigthCount > rightToLeftCount
    ? SortDirection.LEFT_TO_RIGHT
    : SortDirection.RIGHT_TO_LEFT;
};

/**
 * - input arg - pricetags sorted top to bottom
 * - computing angles between pricetags that are vertically closest to each other
 * - helps us guess under what angle is image taken - what angle are shelves with products on them
 */
export const addAngleToNextPricetag = (
  productMetas: ProductMeta[]
): ProductMetaWithAngle[] => {
  const result = productMetas.map(({ roiCenter, ...rest }, index, products) => {
    let angle = undefined;
    if (index < products.length - 1) {
      const pricetagCoords = roiCenter;
      const nextPricetagCoords = products[index + 1].roiCenter;
      console.log(
        (nextPricetagCoords[1], pricetagCoords[1]),
        (nextPricetagCoords[0], pricetagCoords[0])
      );

      angle = Math.atan(
        (nextPricetagCoords[1] - pricetagCoords[1]) /
          (nextPricetagCoords[0] - pricetagCoords[0])
      );
    }
    return { roiCenter, angle, ...rest };
  });

  return result;
};

/**
 * - pricetags sorted top to bottom as found in orig image, have certaing angles between them
 * - given that there are usually multiple pricetags per each shelf, median value of this angle
 * will tell us about angle that shelves have relative to the photo -> what rotation was the users phone
 * when he captured the photo
 * - useful when determining on which shelve each pricetag is
 */
export const getMedianAngle = (productsOnShelves: ProductMetaWithAngle[]) => {
  const medianAngle = productsOnShelves
    .map(({ angle }) => angle)
    .sort(function (a, b) {
      //last image has no angle to next image, needs to be sorted last
      if (b === undefined) {
        return -1;
      }
      if (a === undefined) {
        return 1;
      }
      return a - b;
    })[Math.floor((productsOnShelves.length - 1) / 2)];
  return medianAngle || 0;
};

export const assignDetectedProductsToShelves = (
  productMetas: ProductMetaWithAngle[],
  medianAngle: number
): ProductMetaWithAngleAndShelf[] => {
  /**
   * - pricetags are sorted top to bottom
   * - if the angle to next pricetag does not deviate too much from median, it means the pricetag is probably on the same shelve
   * - if the angle deviates a lot from median, it probably means we 'jumped' to the next shelve in the image
   */

  const UPPER_BOUND = medianAngle + ALLOWED_DEVIATION_FROM_MEDIAN_ANGLE;
  const LOWER_BOUND = medianAngle - ALLOWED_DEVIATION_FROM_MEDIAN_ANGLE;

  let currentShelf = 1; // numbering shelves top to bottom
  const result = productMetas.map(({ angle, ...rest }) => {
    const shelfNumber = currentShelf;
    console.log(angle);

    if (angle != undefined) {
      if (
        angle > SHARP_ANGLE_UP ||
        angle < -SHARP_ANGLE_UP ||
        angle > UPPER_BOUND ||
        angle < LOWER_BOUND
      ) {
        currentShelf += 1;
      }
    }
    return { angle, shelfRow: shelfNumber, ...rest };
  });

  //last product is assigned to the last shelve as it does not have angleToNextImage value
  if (result.length > 0) {
    result[result.length - 1].shelfRow = currentShelf;
  }
  return result;
};
