import { useCallback, useEffect, useRef, useState } from "react";
import { TypedArray } from "@tensorflow/tfjs";

import { MODEL_NAME_PRICE_PATH, MODEL_PRICETAG_PATH } from "_constants";

import { createCollage, denormalizeBoxes } from "_utils/imageCalcs";
import {
  drawImageToCanvas,
  drawBoxesToCanvas,
  imageElemFromCanvas,
} from "_utils/imageProcessing";
import { PricetagDetail, Product, Rack } from "_utils/objects";
import { addDetailsToPricetags } from "_utils/pricetags";
import { guessShelvesMock } from "_utils/shelves";
import { ReshapedOutput } from "_utils/tensor";

import useOcr from "./useOcr";
import useImageModel from "./useImageModel";

type Options = {
  showDebugPhoto?: boolean;
  showDebugCollage?: boolean;
};

type ReturnType = [
  Rack | undefined,
  {
    pricetagResult: ReshapedOutput | undefined;
    namePriceResult: ReshapedOutput | undefined;
    imgCollageRef: React.MutableRefObject<HTMLImageElement>;
    isDetecting: boolean;
  }
];

const PRICETAG_CANVAS_SIZE = 640;
const NAME_PRICES_CANVAS_SIZE = 640;

function useImageToProducts(
  photoFile: File | undefined,
  options: Options = {}
): ReturnType {
  const { showDebugCollage, showDebugPhoto } = options;
  const [imageUrl, setImageUrl] = useState<string>();
  const imgPhotoRef = useRef<HTMLImageElement>(document.createElement("img"));
  const [rack, setRack] = useState<Rack>();
  const [ocrReadText] = useOcr();
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  // model hooks
  const [pricetagResult, pricetagFuncs] = useImageModel(MODEL_PRICETAG_PATH, {
    isDebug: showDebugPhoto,
    canvasSize: PRICETAG_CANVAS_SIZE,
  });
  const [namePriceResult, namePriceFuncs] = useImageModel(
    MODEL_NAME_PRICE_PATH,
    {
      isDebug: showDebugCollage,
    }
  );
  // imgCollageRef is used only for debugging purposes. It is later replaced,
  // but it's initialized now to avoid unnecessary checking for its' existence
  const imgCollageRef = useRef<HTMLImageElement>(document.createElement("img"));

  const readAndUpdateProducts = useCallback(
    async (products: Product[], image: HTMLImageElement) => {
      // products.forEach(async (product, index) => {
      for (const product of products) {
        const nameResult = await ocrReadText(image, product.collage?.name);
        const priceMainResult = await ocrReadText(
          image,
          product.collage?.priceMain
        );
        const priceSubResult = await ocrReadText(
          image,
          product.collage?.priceSub
        );

        product.name = nameResult?.data.text;
        product.priceMain = priceMainResult?.data.text;
        product.priceSub = priceSubResult?.data.text;
      }
    },
    [ocrReadText]
  );

  const findNamesAndPrices = useCallback(
    async (
      boxes: (TypedArray | number[])[]
    ): Promise<[PricetagDetail[], HTMLImageElement]> => {
      const collage = createCollage(boxes, false);
      const ctx = namePriceFuncs.getCanvasContext();
      const image = imgPhotoRef.current;

      if (!ctx || !image) throw new Error("Image or context not ready");
      const canvas = ctx.canvas;
      namePriceFuncs.setCanvasSize(collage.size);

      // draw original boxes to canvas
      drawBoxesToCanvas(image, ctx, boxes, collage.boxes);

      // create img element with full size colage
      const collageImg = await imageElemFromCanvas(canvas);

      // for debugging purposes
      imgCollageRef.current = collageImg;

      // resize canvas before model processing and redraw callage
      namePriceFuncs.setCanvasSize(NAME_PRICES_CANVAS_SIZE);
      drawImageToCanvas(collageImg, ctx);

      const result = await namePriceFuncs.execute();
      const realBoxes = denormalizeBoxes(
        result.boxes,
        collageImg.naturalWidth,
        collageImg.naturalHeight
      );

      const pricetags = collage.boxes.map((rBox) => new PricetagDetail(rBox));
      addDetailsToPricetags(pricetags, realBoxes, result.classes);

      return [pricetags, collageImg];
    },
    [namePriceFuncs]
  );

  const findPriceTags = useCallback(async () => {
    const image = imgPhotoRef.current;
    const ctx = pricetagFuncs.getCanvasContext();

    if (!ctx || !image) throw new Error("Image or context not ready");
    drawImageToCanvas(image, ctx);
    const result = await pricetagFuncs.execute();
    const realBoxes = denormalizeBoxes(
      result.boxes,
      image.naturalWidth,
      image.naturalHeight
    );

    const unsortedProducts = realBoxes.map((rBox) => new Product(rBox));
    const rack = guessShelvesMock(unsortedProducts);
    console.log(rack);
    const sortedProducts = rack.products;

    const [collageProducts, collageImg] = await findNamesAndPrices(
      sortedProducts.map((prod) => prod.original.bbox.coords)
    );

    sortedProducts.forEach(
      (product, prodIndex) => (product.collage = collageProducts[prodIndex])
    );

    await readAndUpdateProducts(sortedProducts, collageImg);
    setRack(rack);
    console.log(rack);
  }, [findNamesAndPrices, pricetagFuncs, readAndUpdateProducts]);

  const startDetection = useCallback(async () => {
    try {
      setIsDetecting(true);
      await findPriceTags();
    } finally {
      setIsDetecting(false);
    }
  }, [findPriceTags]);

  useEffect(() => {
    if (photoFile) {
      const imgUrl = URL.createObjectURL(photoFile);

      setImageUrl(imgUrl);
    }
  }, [photoFile]);

  useEffect(() => {
    if (imageUrl) {
      const imgPhoto = imgPhotoRef.current;

      imgPhoto.src = imageUrl;
      imgPhoto.onload = startDetection;
    }
  }, [imageUrl, startDetection]);

  return [
    rack,
    { pricetagResult, namePriceResult, imgCollageRef, isDetecting },
  ];
}

export default useImageToProducts;
