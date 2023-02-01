import { Product, Rack } from "./objects";
import {
  addAngleToNextPricetag,
  addQuantiziedYCoords,
  assignDetectedProductsToShelves,
  getMedianAngle,
  getShelfSortingDirection,
  sortPricetagsHorizontally,
  sortPricetagsTopToBottom,
  sortShelvesLeftToRight,
  wrapProducts,
} from "./shelvesOperations";

/**
 * Tries to guess shelves number based on horizontal alignment
 * @param products List of products
 */
const guessShelvesMocking = (products: Product[]): Rack => {
  const NUM_OF_SHELVES = 3;
  const shelfSize = Math.ceil(products.length / NUM_OF_SHELVES);
  // console.log(shelfSize, products.length);

  const allShelves = [];

  for (let i = 0; i < NUM_OF_SHELVES; i += 1) {
    const shelf = products.slice(i * shelfSize, i * shelfSize + shelfSize);
    allShelves.push(shelf);
  }

  const rack = new Rack(allShelves);
  return rack;
};

export const guessShelves = (products: Product[]): Rack => {
  const wrappedProducts = wrapProducts(products);
  const productsWithQY = addQuantiziedYCoords(wrappedProducts);
  const sortedTopBottom = sortPricetagsTopToBottom(productsWithQY);
  console.log("productsWithQY");
  console.log(productsWithQY);

  const sorted2 = sortPricetagsHorizontally(
    sortedTopBottom,
    getShelfSortingDirection(sortedTopBottom)
  );

  const productsWithAngles = addAngleToNextPricetag(sorted2);

  const medianAngleBetweenPricetags = getMedianAngle(productsWithAngles);
  const productsWithAssignedShelves = assignDetectedProductsToShelves(
    productsWithAngles,
    medianAngleBetweenPricetags
  );

  //     //so the products can always be read left to right, no matter under what angle image is captured
  const leftToRightSortedProducts = sortShelvesLeftToRight(
    productsWithAssignedShelves
  );

  console.log(leftToRightSortedProducts);

  // TODO: dont' use mock
  return guessShelvesMocking(products);
};

export const x = 1;
