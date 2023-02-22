import { useCallback, useEffect, useRef, useState } from "react";
import type { TypedArray } from "@tensorflow/tfjs";
import {
  MODEL_NAME_PRICE_PATH,
  MODEL_NAME_PRICE_SIZE,
  MODEL_PRICETAG_PATH,
  MODEL_PRICETAG_SIZE,
  OCR_MIN_CONFIDENCE,
} from "_constants";
import { createCollage, denormalizeBoxes } from "_utils/imageCalcs";
import {
  drawImageToCanvas,
  drawBoxesToCanvas,
  imageElemFromCanvas,
  getCanvasFromBox,
  imageUrlFromCanvas,
} from "_utils/imageProcessing";
import { BBox, PricetagDetail, Product, Rack } from "_utils/objects";
import { addDetailsToPricetags } from "_utils/pricetags";
import { findShelves } from "_utils/shelves";
import type { ReshapedOutput } from "_utils/tensor";
import { createPairingMap, PerfMeter } from "_utils/other";
import { PRODUCT_NAME_NOT_FOUND } from "_constants/words";

import useOcr from "./useOcr";
import useImageModel from "./useImageModel";

type Options = {
  showDebugPhoto?: boolean;
  showDebugCollage?: boolean;
  doPricetagImgs?: boolean;
  // doPricetagDetailsImgs?: boolean;
};

type ReturnType = [
  Rack | undefined,
  {
    pricetagResult: ReshapedOutput | undefined;
    namePriceResult: ReshapedOutput | undefined;
    imgCollageRef: React.MutableRefObject<HTMLImageElement>;
    isDetecting: boolean;
    reset: () => void;
  }
];

async function getImageFromBBox(
  originalImage: HTMLImageElement,
  bbox: BBox
): Promise<string> {
  const canvasCtx = getCanvasFromBox(originalImage, bbox);
  const newImage = await imageUrlFromCanvas(canvasCtx.canvas);
  // bbox.imageUrl = newImage;
  return newImage;
}

async function updateProductWithImages(
  product: Product,
  originalImage: HTMLImageElement
) {
  const { bbox: pricetag, name, priceSub, priceMain } = product.collage;
  const detailBoxes = [name, pricetag, priceSub, priceMain];

  for (const box of detailBoxes) {
    if (box) {
      const imageUrl = await getImageFromBBox(originalImage, box);
      box.imageUrl = imageUrl;
    }
  }
}

// const PRICETAG_CANVAS_SIZE = 640;
// const NAME_PRICES_CANVAS_SIZE = 640;

function useImageToProducts(
  photoFile: File | undefined,
  options: Options = {}
): ReturnType {
  const { showDebugCollage, showDebugPhoto, doPricetagImgs } = options;
  const [imageUrl, setImageUrl] = useState<string>();
  const imgPhotoRef = useRef<HTMLImageElement>(document.createElement("img"));
  const imgCollageRef = useRef<HTMLImageElement>(document.createElement("img"));
  const [rack, setRack] = useState<Rack>();
  const [ocrReadText] = useOcr();
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  // model hooks
  const [pricetagResult, pricetagFuncs] = useImageModel(MODEL_PRICETAG_PATH, {
    isDebug: showDebugPhoto,
    canvasSize: MODEL_PRICETAG_SIZE,
  });
  const [namePriceResult, namePriceFuncs] = useImageModel(
    MODEL_NAME_PRICE_PATH,
    {
      isDebug: showDebugCollage,
    }
  );

  const ocrAndUpdateProds = useCallback(
    async (products: Product[], image: HTMLImageElement) => {
      // products.forEach(async (product, index) => {
      for (const product of products) {
        let nameRes = await ocrReadText(image, product.collage.name);
        let priceMainRes = await ocrReadText(image, product.collage.priceMain, {
          numbersOnly: true,
        });
        let priceSubRes = await ocrReadText(image, product.collage.priceSub, {
          numbersOnly: true,
        });

        [nameRes, priceMainRes, priceSubRes] = [
          nameRes,
          priceMainRes,
          priceSubRes,
        ].map((res) => {
          return (res?.data.confidence || 0) > OCR_MIN_CONFIDENCE
            ? res
            : undefined;
        });

        product.name = nameRes?.data.text.trim() || PRODUCT_NAME_NOT_FOUND;
        product.priceMain = priceMainRes?.data.text.trim();
        product.priceSub = priceSubRes?.data.text.trim();
      }
    },
    [ocrReadText]
  );

  /**
   * Create Array PriceTag details for given @boxes parameter, returned in same order
   */
  const findNamesAndPrices = useCallback(
    async (
      boxes: (TypedArray | number[])[]
    ): Promise<[PricetagDetail[], HTMLImageElement]> => {
      const collage = createCollage(boxes, false);
      const ctx = namePriceFuncs.getCanvasContext();
      const image = imgPhotoRef.current;

      if (!ctx || !image) throw new Error("Image or context not ready");
      const canvas = ctx.canvas;
      const originalSize = canvas.width;
      namePriceFuncs.setCanvasSize(collage.size);

      // draw original boxes to canvas
      drawBoxesToCanvas(image, ctx, boxes, collage.boxes);

      // create img element with full size collage
      const collageImg = await imageElemFromCanvas(canvas);

      // for debugging purposes
      imgCollageRef.current = collageImg;

      // resize canvas before model processing and redraw collage image
      namePriceFuncs.setCanvasSize(MODEL_NAME_PRICE_SIZE || originalSize);
      drawImageToCanvas(collageImg, ctx);

      const result = await namePriceFuncs.execute();
      const realBoxes = denormalizeBoxes(
        result.boxes,
        collageImg.naturalWidth,
        collageImg.naturalHeight
      );

      const pricetags = collage.boxes.map(
        (realBox) => new PricetagDetail(realBox)
      );
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

    return realBoxes;
  }, [pricetagFuncs]);

  const mainFunction = useCallback(async () => {
    const priceTagCoords = await findPriceTags();
    const priceTagBBoxes = priceTagCoords.map((coords) => new BBox(coords));

    const perfMeter = new PerfMeter("general");

    // const origCollagePairs =

    // const unsortedProducts = realBoxes.map((rBox) => new Product(rBox));
    const [pricetagDetails, collageImg] = await findNamesAndPrices(
      priceTagCoords
    );

    const priceTagDetailPairs = createPairingMap(
      priceTagBBoxes,
      pricetagDetails
    );

    const priceTagsShelves = findShelves(priceTagBBoxes);

    const productsOnShelves = priceTagsShelves.map((shelf) =>
      shelf.map(
        (priceTagBBox) =>
          new Product(priceTagBBox, priceTagDetailPairs.get(priceTagBBox))
      )
    );

    const products = productsOnShelves.flat();

    if (doPricetagImgs) {
      perfMeter.start("generate images");
      await Promise.allSettled(
        Array.from(
          products,
          async (product) => await updateProductWithImages(product, collageImg)
        )
      );
      perfMeter.end();
    }

    // sortedProducts.forEach(
    //   (product, prodIndex) => (product.collage = pricetagDetails[prodIndex])
    // );
    perfMeter.start("OCR all");
    await ocrAndUpdateProds(products, collageImg);
    perfMeter.end();

    const rack = new Rack(productsOnShelves);

    console.log(rack);
    setRack(rack);
    // console.log(rack);
  }, [
    findNamesAndPrices,
    // pricetagFuncs,
    ocrAndUpdateProds,
    doPricetagImgs,
    findPriceTags,
  ]);

  const startDetection = useCallback(async () => {
    try {
      setIsDetecting(true);
      await mainFunction();
    } finally {
      setIsDetecting(false);
    }
  }, [mainFunction]);

  useEffect(() => {
    if (photoFile) {
      setIsDetecting(true);
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

  const reset = useCallback(() => {
    setImageUrl(undefined);
    setRack(undefined);
    pricetagFuncs.reset();
    namePriceFuncs.reset();
  }, [pricetagFuncs, namePriceFuncs]);

  return [
    rack,
    { pricetagResult, namePriceResult, imgCollageRef, isDetecting, reset },
  ];
}

export default useImageToProducts;
