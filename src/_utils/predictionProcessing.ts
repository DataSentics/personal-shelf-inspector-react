// const doGeometryToGuessWhereAreShelves = (
//   productsOnShelves: ProductOnTheShelf[]
// ): ProductOnTheShelf[] => {
//   const productWithQuantization =
//     computeQuantizedYcoordsOfPricetags(productsOnShelves);

//   const sortedQuantizedProducts = sortPricetagsTopToBottom(
//     productWithQuantization
//   );
//   //logPricetagCoordYAfterQuantization(sortedQuantizedProducts);

//   const horizontallySortedProducts = sortPricetagsHorizontally(
//     sortedQuantizedProducts,
//     getShelfSortingDirection(sortedQuantizedProducts)
//   );

//   const productsWithAngles = computeAllAnglesToNextPricetag(
//     horizontallySortedProducts
//   );
//   //logSortedAngleValues(productsWithAngles);

//   const medianAngleBetweenPricetags =
//     computeMedianAngleToNextPricetag(productsWithAngles);
//   const productsWithAssignedShelves = assignDetectedProductsToShelves(
//     productsWithAngles,
//     medianAngleBetweenPricetags
//   );

//   //so the products can always be read left to right, no matter under what angle image is captured
//   const leftToRightSortedProducts = sortShelvesLeftToRight(
//     productsWithAssignedShelves
//   );

//   return leftToRightSortedProducts;
// };

// export { doGeometryToGuessWhereAreShelves };
export const a = 1;
