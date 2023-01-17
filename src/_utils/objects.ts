import { TypedArray } from "@tensorflow/tfjs";

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

  /**
   * Returns true if the bounding box of this element is fully containing given element.
   * @param {BBox} bbox - the bounding box of the element.
   * @returns {boolean} - true if the bounding box of the filter is contained within the bounding box of
   * the element.
   */
  public wraps(bbox: BBox): boolean {
    const { x1, y1, x2, y2 } = this;
    return x1 <= bbox.x1 && y1 <= bbox.y1 && x2 >= bbox.x2 && y2 >= bbox.y2;
  }

  /**
   * Returns true if the bounding box of this element is fully contained
   * within the bounding box of given element.
   */
  public isWrappedBy(bbox: BBox): boolean {
    const { x1, y1, x2, y2 } = this;
    return x1 >= bbox.x1 && y1 >= bbox.y1 && x2 <= bbox.x2 && y2 <= bbox.y2;
  }
}

enum PriceDetailClass {
  NAME = 2,
  PRICE_MAIN = 0,
  PRICE_SUB = 1,
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
 * A class that represents product.
 * It contains the original and collage pricetags information
 * @param {BBoxCoords} original - The original pricetag bounding box.
 * @param {BBoxCoords} collage - The collage pricetag bounding box.
 */
export class Product {
  readonly original: PricetagCoords;
  readonly collage: PricetagCoords;

  name: string | undefined = undefined;
  priceMain: string | number | undefined = undefined;
  priceSub: string | number | undefined = undefined;

  constructor(original: BBoxCoords, collage: BBoxCoords) {
    this.original = new PricetagCoords(original);
    this.collage = new PricetagCoords(collage);
  }
}
