import { useCallback, useEffect, useRef, useState } from "react";
import { TypedArray } from "@tensorflow/tfjs";

import {
  MODEL_NAME_PRICE_PATH,
  MODEL_NAME_PRICE_SIZE,
  MODEL_PRICETAG_PATH,
  MODEL_PRICETAG_SIZE,
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
import { guessShelvesMock } from "_utils/shelves";
import { ReshapedOutput } from "_utils/tensor";

import useOcr from "./useOcr";
import useImageModel from "./useImageModel";
import { PerfMeter } from "_utils/other";

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
  const {
    showDebugCollage,
    showDebugPhoto,
    doPricetagImgs,
    // doPricetagDetailsImgs,
  } = options;
  const [imageUrl, setImageUrl] = useState<string>();
  const imgPhotoRef = useRef<HTMLImageElement>(document.createElement("img"));
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
  // imgCollageRef is used only for debugging purposes. It is later replaced,
  // but it's initialized now to avoid unnecessary checking for its' existence
  const imgCollageRef = useRef<HTMLImageElement>(document.createElement("img"));

  const ocrAndUpdateProds = useCallback(
    async (products: Product[], image: HTMLImageElement) => {
      // products.forEach(async (product, index) => {
      for (const product of products) {
        const nameResult = await ocrReadText(image, product.collage.name);
        const priceMainResult = await ocrReadText(
          image,
          product.collage.priceMain
        );
        const priceSubResult = await ocrReadText(
          image,
          product.collage.priceSub
        );

        product.name = nameResult?.data.text.trim();
        product.priceMain = priceMainResult?.data.text.trim();
        product.priceSub = priceSubResult?.data.text.trim();
      }
    },
    [ocrReadText]
  );

  // useEffect(() => {
  //   async function perform(rack: Rack) {
  //     // if (rack) {
  //     const products = rack.products;
  //     for (const product of products) {
  //       await updateProductWithImages(product, imgPhotoRef.current);
  //       // }
  //     }
  //   }
  //   if (doPricetagImgs && rack) perform(rack);
  // }, [rack, doPricetagImgs]);

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

      // create img element with full size colage
      const collageImg = await imageElemFromCanvas(canvas);

      // for debugging purposes
      imgCollageRef.current = collageImg;

      // resize canvas before model processing and redraw callage image
      namePriceFuncs.setCanvasSize(MODEL_NAME_PRICE_SIZE || originalSize);
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

    // const unsortedProducts = realBoxes.map((rBox) => new Product(rBox));
    const [pricetagDetails, collageImg] = await findNamesAndPrices(realBoxes);

    const unsortedProducts = realBoxes.map(
      (rBox, rBoxIndex) => new Product(rBox, pricetagDetails[rBoxIndex])
    );

    const rack = guessShelvesMock(unsortedProducts);
    console.log(rack);
    const sortedProducts = rack.products;

    // async function perform(rack: Rack) {
    //   // if (rack) {
    //   const products = rack.products;
    //   for (const product of products) {
    //     await updateProductWithImages(product, imgPhotoRef.current);
    //     // }
    //   }
    // }
    if (doPricetagImgs && rack) {
      for (const product of sortedProducts) {
        await updateProductWithImages(product, collageImg);
        // }
      }
    }

    // sortedProducts.forEach(
    //   (product, prodIndex) => (product.collage = pricetagDetails[prodIndex])
    // );
    const perf = new PerfMeter("OCR main");
    await ocrAndUpdateProds(sortedProducts, collageImg);
    perf.end();

    setRack(rack);
    console.log(rack);
  }, [findNamesAndPrices, pricetagFuncs, ocrAndUpdateProds, doPricetagImgs]);

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
