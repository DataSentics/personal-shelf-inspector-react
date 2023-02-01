// // import { Product, ProductOnShelf, RectCoords } from "./objects";

import { Product } from "./objects";

// type BoxCoords = [number, number, number, number] | Array<number>; // x1, y1, x2, y2

// export type RectCoords = BoxCoords;

// type Rectangle = {
//   coords: BoxCoords;
// };

// // class Roi implements Rectangle {
// //   coords: RectCoords;
// //   score: number;

// //   constructor(coords: RectCoords, score: number) {
// //     this.coords = coords;
// //     this.score = score;
// //   }
// // }

// export type Roi = Rectangle & { score: number };

// // export type DetectedPriceTag = Roi & {
// //   //   constructor(coords: RectCoords, score: number) {
// //   //     super(coords, score);
// //   //   }
// //   shelfNumber: number;
// // };

// export type Product = {
//   pricetag: Roi;
// };

// export type ProductOnShelf = Product & {
//   shelfRow: number;
// };
// // const sortBy;

// // type ProductWithQY = {
// //   quantiziedY: number;
// //   product: Product;
// // };

// type ProductMetaBase = {
//   product: Product;
// };

// type ProductMeta = ProductMetaBase & {
//   quantiziedY: number;
//   roiCenter: [number, number];
// };

// type ProductMetaWithAngle = ProductMeta & {
//   angle: number | undefined;
// };

// type ProductMetaWithAngleAndShelf = ProductMetaWithAngle & {
//   shelfRow: number;
// };

const SOME_QUANTIZATION_CONSTANT = 3;
const ALLOWED_DEVIATION_FROM_MEDIAN_ANGLE = 0.14; //in radians todo test if some value better
const SHARP_ANGLE_UP = 0.78; //in radians

const mean = (values: number[]): number =>
  values.reduce((a, b) => a + b, 0) / values.length;

// export interface WrappedProduct<T extends Product> {
//   product: T;
// }

export type WrappedProductType = { product: Product };

type WrapQuantizied<T extends WrappedProductType> = T & { quantiziedY: number };
type WithAngle<T extends WrappedProductType> = T & {
  angle: number | undefined;
};
type WithRank<T extends WrappedProductType> = T & { shelfRank: number };

export function wrapProducts(products: Product[]): WrappedProductType[] {
  return products.map((product) => ({ product }));
}

// type A = { a: number };
// type B = { b: number };
// const a: A & B = { a: 1 };

// type Wrap<T extends >
/**
 * Sometimes detected pricetags are not sorted left to right correctly in the shelves, when first sorted top to bottom.
 * That may be, because pricetags with similar Y coords end up being detected slightly higher or lower than their neighbours on the shelves.
 * We solve this by quantizing Y coords of the detected pricetags,
 * so we can later sort pricetags with same quantized Y by their X coord value.

 * @param products
 * @returns List of products with quantizied y1 coord
 */
export function addQuantiziedYCoords<T extends WrappedProductType>(
  wrappedProducts: T[]
): Array<WrapQuantizied<T>> {
  const boxesHeightMean = mean(
    wrappedProducts.map((prodWrap) => {
      const box = prodWrap.product.original.bbox;
      return box.y2 - box.y1;
    })
  );
  // const boxesHeights = boxes.map(([_x1, y1, _x2, y2]) => y2 - y1);
  // const heightMean = mean(boxes.map((box) => box.y2 - box.y1));
  // const heightMean2 = boxes.map((box) => box.y2 - box.y1);
  const quantizationStepSize = Math.floor(
    boxesHeightMean / SOME_QUANTIZATION_CONSTANT
  );

  const productsWithQY = wrappedProducts.map((prodWrap) => {
    return {
      ...prodWrap,
      quantiziedY:
        Math.floor(prodWrap.product.original.bbox.y2 / quantizationStepSize) *
        quantizationStepSize,
    };
  });

  return productsWithQY;
}



// /**
//  * Sorts list of detected pricetags based on their y coord in the original image
//  */
export function sortPricetagsTopToBottom<T extends WrappedProductType>(
  prodsWrap: Array<T>
): T[] {
  return prodsWrap.sort(
    ({ product: { original: origA } }, { product: { original: origB } }) =>
      origA.bbox.center.y - origB.bbox.center.y
  );
}

// /**
//  * Now I have shelve numbers assigned to all products
//  * time to sort each shelve left to right
//  */
export function sortShelvesLeftToRight<T extends WithRank<WrappedProductType>>(
  products: T[]
): T[] {
  return products.sort(
    (
      { shelfRank: rankA, product: { original: origA } },
      { shelfRank: rankB, product: { original: origB } }
    ) =>
      rankA === rankB
        ? origA.bbox.center.x - origB.bbox.center.x
        : rankA - rankB
  );
}

enum SortDirection {
  LEFT_TO_RIGHT = "leftToRight",
  RIGHT_TO_LEFT = "rightToLeft",
}

// /**
//  * Input: detected pricetag list sorted by Y coord value.
//  * Sort detected pricetag images with the same Y coord (presumably located on the same shelve)
//  * LEFT_TO_RIGHT or RIGHT_TO_LEFT by  their X coord
//  */
export function sortPricetagsHorizontally<T extends WrappedProductType>(
  products: WrapQuantizied<T>[],
  direction: SortDirection = SortDirection.LEFT_TO_RIGHT
): WrapQuantizied<T>[] {
  return products.sort(
    (
      {
        quantiziedY: aQuant,
        product: {
          original: { bbox: boxA },
        },
      },
      {
        quantiziedY: bQuant,
        product: {
          original: { bbox: boxB },
        },
      }
    ) => {
      if (aQuant === bQuant) {
        return direction == SortDirection.LEFT_TO_RIGHT
          ? boxA.center.x - boxB.center.x
          : boxB.center.x - boxA.center.x;
      }
      return aQuant - bQuant;
    }
  );

}

// /**
//  * Depending on angle of camera, when capturing image
//  * the shelves are usually tilted not perfectly horizontal
//  * We want to know if this is LEFT_TO_RIGHT or RIGHT_TO_LEFT ->
//  * which side of shelve on the photo has higher y coord value?
//  */
export function getShelfSortingDirection<T extends WrappedProductType>(
  productMetas: T[]
): SortDirection {
  let lefToRigthCount = 0;
  let rightToLeftCount = 0;

  productMetas.forEach(({ product }, index, products) => {
    if (index > 0) {
      const currBox = product.original.bbox;
      const prevBox = products[index - 1].product.original.bbox;
      currBox.center.x > prevBox.center.y
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
}

// /**
//  * - input arg - pricetags sorted top to bottom
//  * - computing angles between pricetags that are vertically closest to each other
//  * - helps us guess under what angle is image taken - what angle are shelves with products on them
//  */
export const addAngleToNextPricetag = (
  productMetas: WrappedProductType[]
): Array<WrappedProductType & { angle: number | undefined }> => {
  const result = productMetas.map(({ product, ...rest }, index, products) => {
    let angle = undefined;
    if (index < products.length - 1) {
      const currBox = product.original.bbox;
      const nextBox = products[index + 1].product.original.bbox;

      angle = Math.atan(
        (nextBox.center.y - currBox.center.y) /
          (nextBox.center.x - currBox.center.x)
      );
    }
    return { angle, product, ...rest };
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
export function getMedianAngle<T extends WrappedProductType>(
  products: WithAngle<T>[]
) {
  const medianAngle = products
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
    })[Math.floor((products.length - 1) / 2)];
  return medianAngle || 0;
}

export function assignDetectedProductsToShelves<
  T extends WithAngle<WrappedProductType>
>(products: Array<T>, medianAngle: number): Array<T & { shelfRank: number }> {
  /**
   * - pricetags are sorted top to bottom
   * - if the angle to next pricetag does not deviate too much from median, it means the pricetag is probably on the same shelve
   * - if the angle deviates a lot from median, it probably means we 'jumped' to the next shelve in the image
   */

  const UPPER_BOUND = medianAngle + ALLOWED_DEVIATION_FROM_MEDIAN_ANGLE;
  const LOWER_BOUND = medianAngle - ALLOWED_DEVIATION_FROM_MEDIAN_ANGLE;

  let currentShelf = 1; // numbering shelves top to bottom
  const result = products.map((prod) => {
    const shelfRank = currentShelf;
    const angle = prod.angle;
    console.log(angle);

    if (angle !== undefined) {
      if (
        angle > SHARP_ANGLE_UP ||
        angle < -SHARP_ANGLE_UP ||
        angle > UPPER_BOUND ||
        angle < LOWER_BOUND
      ) {
        currentShelf += 1;
      }
    }
    return { ...prod, shelfRank };
  });

  //last product is assigned to the last shelve as it does not have angleToNextImage value
  // if (result.length > 0) {
  //   result[result.length - 1].shelfRow = currentShelf;
  // }
  return result;
}

export const x = 1;
