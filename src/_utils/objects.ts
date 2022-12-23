export type RectCoords = [number, number, number, number] | Array<number>; // x1, y1, x2, y2

type Rectangle = {
  coords: RectCoords;
};

// class Roi implements Rectangle {
//   coords: RectCoords;
//   score: number;

//   constructor(coords: RectCoords, score: number) {
//     this.coords = coords;
//     this.score = score;
//   }
// }

export type Roi = Rectangle & { score: number };

// export type DetectedPriceTag = Roi & {
//   //   constructor(coords: RectCoords, score: number) {
//   //     super(coords, score);
//   //   }
//   shelfNumber: number;
// };

export type Product = {
  pricetag: Roi;
};

export type ProductOnShelf = Product & {
  shelfRow: number;
};