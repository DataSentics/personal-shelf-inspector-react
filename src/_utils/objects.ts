import { TypedArray } from "@tensorflow/tfjs";

type BoxCoords = [number, number, number, number] | Array<number>; // x1, y1, x2, y2

export type RectCoords = BoxCoords;

type Rectangle = {
  coords: BoxCoords;
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

// NEW
export type BBoxCoords = TypedArray | number[];

/**
 * A class that represents a bounding box.
 * @param {BBoxCoords} coordinates - the coordinates of the bounding box.
 */
export class BBox {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  constructor(coordinates: BBoxCoords) {
    this.x1 = coordinates[0];
    this.y1 = coordinates[1];
    this.x2 = coordinates[2];
    this.y2 = coordinates[3];
  }

  public get width() {
    const { x1, x2 } = this;
    return x2 - x1;
  }

  public get height() {
    const { y1, y2 } = this;
    return y2 - y1;
  }

  public get coords(): [number, number, number, number] {
    const { x1, y1, x2, y2 } = this;
    return [x1, y1, x2, y2];
  }

  public wraps(bbox: BBox): boolean {
    const { x1, y1, x2, y2 } = this;
    return x1 <= bbox.x1 && y1 <= bbox.y1 && x2 >= bbox.x2 && y2 >= bbox.y2;
  }
  public isWrappedBy(bbox: BBox): boolean {
    const { x1, y1, x2, y2 } = this;
    return x1 >= bbox.x1 && y1 >= bbox.y1 && x2 <= bbox.x2 && y2 <= bbox.y2;
  }
}

enum PriceDetailClass {
  NAME = 0,
  PRICE_MAIN = 1,
  PRICE_SUB = 2,
}
/**
 * A class that represents a pricetag
 *  with its' coordinates relative to the image
 * @param {BBoxCoords} bboxCoordinates - the coordinates of the pricetag.
 */
export class PricetagCoords {
  bbox: BBox;

  name: BBox | undefined = undefined;
  priceMain: BBox | undefined = undefined;
  priceSub: BBox | undefined = undefined;

  constructor(bboxCoordinates: BBoxCoords) {
    this.bbox = new BBox(bboxCoordinates);
  }

  public addDetail(box: BBox, detailClass: number): boolean {
    if (Object.values(PriceDetailClass).includes(detailClass)) {
      if (detailClass === PriceDetailClass.NAME) this.name = box;
      if (detailClass === PriceDetailClass.PRICE_MAIN) this.priceMain = box;
      if (detailClass === PriceDetailClass.PRICE_SUB) this.priceSub = box;

      return true;
    }
    console.warn(
      "Adding PriceTag Detail Class of unknown value. " +
        `value: '${detailClass}', allowed: ${Object.values(PriceDetailClass)}.`
    );
    return false;
  }
}

/**
 * A class that represents 2 pricetags on different images
 *  It contains the original and collage pricetags.
 * @param {BBoxCoords} original - The original pricetag bounding box.
 * @param {BBoxCoords} collage - The collage pricetag bounding box.
 */
export class PricetagMulti {
  original: PricetagCoords;
  collage: PricetagCoords;

  constructor(original: BBoxCoords, collage: BBoxCoords) {
    this.original = new PricetagCoords(original);
    this.collage = new PricetagCoords(collage);
  }
}
