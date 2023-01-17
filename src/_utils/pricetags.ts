import { TypedArray } from "@tensorflow/tfjs";
import { Boxes } from "_types";
import { BBox, BBoxCoords, PricetagCoords } from "./objects";

export function addDetailsToPricetags(
  pricetags: PricetagCoords[],
  details: BBoxCoords[],
  detailsClasses: number[] | TypedArray
): void {
  const detailsBboxes = details.map((det) => new BBox(det));

  // Find for each detail bbox its' parent pricetag.
  // Each detail will be assigner only once
  detailsBboxes.forEach((detail, detailIndex) => {
    const parentPricetag = pricetags.find((prcTag) =>
      prcTag.bbox.wraps(detail)
    );
    if (parentPricetag) {
      parentPricetag.addDetail(detail, detailsClasses[detailIndex]);
    } else {
      console.warn("Can't find parent pricetag for detail BBox.");
    }
  });
}
