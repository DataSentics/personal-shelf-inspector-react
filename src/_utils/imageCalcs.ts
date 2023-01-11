import { TypedArray } from "@tensorflow/tfjs";

const SPACE = 10;
const TAGS_PER_ROW = 4;

/**
 * Calculate new dimesions for image we want resize & fit into parent box
 * @param imageSize
 * @param parentSize
 * @returns new dimensions and ratio of resized image
 */
export const resizeDimsFit = (
  imageSize: [number, number],
  parentSize: [number, number]
) => {
  const [imageW, imageH] = imageSize;
  const [parentW, parentH] = parentSize;
  const ratio = Math.min(parentW / imageW, parentH / imageH);

  const newWidth = Math.round(imageW * ratio);
  const newHeight = Math.round(imageH * ratio);

  return { newWidth, newHeight, ratio };
};

/**
 * Fit all boxes into one collage image
 * @param boxes
 * @returns
 */
export const getCollageBoxes = (
  boxes: (number[] | TypedArray)[],
  maxSize?: number | false,
  tagsPerRow = TAGS_PER_ROW
) => {
  let x_cursor = SPACE;
  let y_cursor = 0;
  let maxHeightInRow = 0;
  let collageWidth = 0;
  let collageBoxes = boxes.map((box, boxIndex) => {
    if (boxIndex % tagsPerRow === 0) {
      collageWidth = Math.max(x_cursor, collageWidth);
      x_cursor = SPACE;
      y_cursor += maxHeightInRow + SPACE;
      maxHeightInRow = 0;
    }

    const [x1, y1, x2, y2] = box;
    const boxWidth = x2 - x1;
    const boxHeight = y2 - y1;

    const collageBox = [
      x_cursor,
      y_cursor,
      x_cursor + boxWidth,
      y_cursor + boxHeight,
    ];

    maxHeightInRow = Math.max(boxHeight, maxHeightInRow);
    x_cursor = x_cursor + boxWidth + SPACE;
    // console.log(collageBox);
    return collageBox;
  });

  // console.log("collageBoxes", ...collageBoxes);

  let collageHeight = y_cursor + maxHeightInRow + SPACE;
  if (maxSize) {
    const { ratio } = resizeDimsFit(
      [collageWidth, collageHeight],
      [maxSize, maxSize]
    );
    collageBoxes = collageBoxes.map((box) =>
      box.map((b) => Math.round(b * ratio))
    );
    collageHeight = maxSize;
    collageWidth = maxSize;
    // collageBoxes.map(box => box.map())
  }

  return { boxes: collageBoxes, height: collageHeight, width: collageWidth };
};

/**
 * Normalize x,y coords from model output coordinates
 * TODO: take into consideration if model wasnt' square (ratio != 1)
 * @param coords normalized x, y
 * @param imageWidth originalImage width
 * @param imageHeight originalImage height
 * @returns denorlmalized x,y coordinates
 */
function denormalizeCoords(
  coords: [number, number],
  imageWidth: number,
  imageHeight: number
) {
  const [x, y] = coords;
  const imgSize = Math.max(imageWidth, imageHeight);

  return [
    Math.round(x * imgSize), //  - (imgSize - imageWidth) / 2),
    Math.round(y * imgSize), //  - (imgSize - imageHeight) / 2),
  ];
}

/**
 * DenormalizeBoxes. See 'denormalizeCoords' function
 */
export const denormalizeBoxes = (
  boxes: (TypedArray | number[])[],
  imageWidth: number,
  imageHeight: number
): (TypedArray | number[])[] => {
  const convertedBoxes = boxes.map(([x1, y1, x2, y2]) => {
    const c1 = denormalizeCoords([x1, y1], imageWidth, imageHeight);
    const c2 = denormalizeCoords([x2, y2], imageWidth, imageHeight);
    return [...c1, ...c2];
  });
  return convertedBoxes;
};
