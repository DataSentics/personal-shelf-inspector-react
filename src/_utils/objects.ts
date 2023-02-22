import { TypedArray } from "@tensorflow/tfjs";
import { getUUID } from "./uuid";

// NEW
export type BBoxCoordsExact = [number, number, number, number];
export type BBoxCoords = TypedArray | number[] | BBoxCoordsExact; // | [number,number,number,number]

export type Roi = { score: number; coords: BBoxCoords };

export interface PointBase {
  readonly x: number;
  readonly y: number;
}
export class Point implements PointBase {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public get coords() {
    return [this.x, this.y];
  }

  // public sameAs(point: PointBase) {
  //   return this.x === point.x && this.y === point.y;
  // }
}

export type LinePoints = Array<PointBase>;

/**
 * A class that represents a bounding box.
 * @param {BBoxCoords} coordinates - the coordinates of the bounding box.
 */
export class BBox {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  imageUrl?: string;

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

  public get rectangle() {
    const { x1, y1, height, width } = this;
    return { top: y1, left: x1, height, width };
  }

  public get center(): Point {
    const { x1, y1, x2, y2 } = this;
    return new Point((x2 - x1) / 2 + x1, (y2 - y1) / 2 + y1);
  }

  public get leftBottom(): Point {
    const { x1, y2 } = this;
    return new Point(x1, y2);
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
  readonly bbox: BBox;
  // private _imageUrl?: string; // path to file

  constructor(bbox: BBox | BBoxCoords) {
    if (Array.isArray(bbox)) {
      this.bbox = new BBox(bbox);
    } else {
      this.bbox = bbox as BBox;
    }
  }
}

export class PricetagDetail extends PricetagCoords {
  // bbox: BBox;

  name: BBox | undefined = undefined;
  priceMain: BBox | undefined = undefined;
  priceSub: BBox | undefined = undefined;

  // constructor(bboxCoordinates: BBoxCoords) {
  //   this.bbox = new BBox(bboxCoordinates);
  // }

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

export class ProductBase {
  readonly original: PricetagCoords;
  public readonly _id: string;

  name: string | undefined = undefined;
  priceMain: string | number | undefined = undefined;
  priceSub: string | number | undefined = undefined;

  constructor(original: BBox) {
    this.original = new PricetagCoords(original);
    this._id = getUUID();
    // this.collage = new PricetagDetail(collage);
  }
}

/**
 * A class that represents product.
 * It contains the original and collage pricetags information
 * @param {BBox} original - The original pricetag bounding box.
 * @param {BBoxCoords} collage - The collage pricetag bounding box.
 */
export class Product extends ProductBase {
  // readonly original: PricetagCoords;
  readonly collage: PricetagDetail;

  constructor(original: BBox, collage: PricetagDetail) {
    super(original);
    // this.collage = new PricetagDetail(collage);
    this.collage = collage;
  }
}

type Shelf = Array<Product>;

export class Rack {
  constructor(public shelves: Array<Shelf> = []) {}

  public get products(): Product[] {
    return this.shelves.flat();
  }
}

export const getBoxLeftBottom = (bBox: BBox): PointBase => bBox.leftBottom;
// const getBoxHeight = (bBox: BBox): number => bBox.height;
export const getPointX = (point: PointBase): number => point.x;
