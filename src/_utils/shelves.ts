import { Product, ProductOnShelf } from "./shelvesOperations";
import {
  addAngleToNextPricetag,
  addPriceTagCenter,
  addQuantiziedYCoords,
  assignDetectedProductsToShelves,
  getMedianAngle,
  getShelfSortingDirection,
  sortPricetagsHorizontally,
  sortPricetagsTopToBottom,
  sortShelvesLeftToRight,
} from "./shelvesOperations";

/**
 * Tries to guess shelves number based on horizontal alignment
 * @param products List of products
 */
export const guessShelves = (products: Product[]): ProductOnShelf[] => {
  const productsWithQY = addQuantiziedYCoords(
    products.map((product) => ({ product }))
  );
  console.log("productsWithQY");
  console.log(productsWithQY);

  const productsMeta = addPriceTagCenter(productsWithQY);
  const sorted1 = sortPricetagsTopToBottom(productsMeta);

  const horizontallySortedProducts = sortPricetagsHorizontally(
    sorted1,
    getShelfSortingDirection(sorted1)
  );

  const productsWithAngles = addAngleToNextPricetag(horizontallySortedProducts);
  //     //logSortedAngleValues(productsWithAngles);

  const medianAngleBetweenPricetags = getMedianAngle(productsWithAngles);
  const productsWithAssignedShelves = assignDetectedProductsToShelves(
    productsWithAngles,
    medianAngleBetweenPricetags
  );

  //     //so the products can always be read left to right, no matter under what angle image is captured
  const leftToRightSortedProducts = sortShelvesLeftToRight(
    productsWithAssignedShelves
  );

  //     return leftToRightSortedProducts;
  return leftToRightSortedProducts.map((meta) => ({
    pricetag: meta.product.pricetag,
    shelfRow: meta.shelfRow,
  }));
};
