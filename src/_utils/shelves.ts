import { Product, Rack } from "./objects";

/**
 * Tries to guess shelves number based on horizontal alignment
 * @param products List of products
 */
export const guessShelvesMock = (products: Product[]): Rack => {
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
