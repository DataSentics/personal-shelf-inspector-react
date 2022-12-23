import { Product, ProductOnShelf, RectCoords } from "./objects";

const SOME_QUANTIZATION_CONSTANT = 3;

const mean = (values: number[]): number =>
  values.reduce((a, b) => a + b, 0) / values.length;

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

/**
 * Sometimes detected pricetags are not sorted left to right correctly in the shelves, when first sorted top to bottom.
 * That may be, because pricetags with similar Y coords end up being detected slightly higher or lower than their neighbours on the shelves.
 * We solve this by quantizing Y coords of the detected pricetags,
 * so we can later sort pricetags with same quantized Y by their X coord value.

 * @param products 
 * @returns List of products with quantizied y1 coord
 */
const addQuantiziedYCoords = <T extends ProductMetaBase>(
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

const addPriceTagCenter = <T extends ProductMetaBase>(
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
const sortPricetagsTopToBottom = (productMetas: ProductMeta[]): ProductMeta[] =>
  productMetas.sort((a, b) => a.roiCenter[1] - b.roiCenter[1]);

/**
 * Now I have shelve numbers assigned to all products
 * time to sort each shelve left to right
 */
const sortShelvesLeftToRight = (productMetas: ProductMeta[]): ProductMeta[] =>
  productMetas.sort(
    (
      { quantiziedY: qyA, roiCenter: roiA },
      { quantiziedY: qyB, roiCenter: roiB }
    ) => (qyA === qyB ? roiA[0] - roiB[0] : qyA - qyB)
  );

/**
 * Tries to guess shelves number based on horizontal alignment
 * @param products List of products
 */
export const guessShelves = (products: Product[]): Product[] => {
  const productsWithQY = addQuantiziedYCoords(
    products.map((product) => ({ product }))
  );
  const productsMeta = addPriceTagCenter(productsWithQY);
  const sorted1 = sortPricetagsTopToBottom(productsMeta);
  // const sorted2 = sortShelvesLeftToRight(productsMeta);

  //     const sortedQuantizedProducts = sortPricetagsTopToBottom(productWithQuantization);
  //     //logPricetagCoordYAfterQuantization(sortedQuantizedProducts);

  //     const horizontallySortedProducts = sortPricetagsHorizontally(
  //       sortedQuantizedProducts,
  //       getShelfSortingDirection(sortedQuantizedProducts),
  //     );

  //     const productsWithAngles = computeAllAnglesToNextPricetag(horizontallySortedProducts);
  //     //logSortedAngleValues(productsWithAngles);

  //     const medianAngleBetweenPricetags =
  //       computeMedianAngleToNextPricetag(productsWithAngles);
  //     const productsWithAssignedShelves = assignDetectedProductsToShelves(
  //       productsWithAngles,
  //       medianAngleBetweenPricetags,
  //     );

  //     //so the products can always be read left to right, no matter under what angle image is captured
  //     const leftToRightSortedProducts = sortShelvesLeftToRight(productsWithAssignedShelves);

  //     return leftToRightSortedProducts;
  return productsMeta.map((meta) => meta.product);
};
