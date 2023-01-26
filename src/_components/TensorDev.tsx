import { useEffect, useRef, useState } from "react";
import { GraphModel, TypedArray } from "@tensorflow/tfjs";

import { useImageModel } from "_utils/useImageModel";
import { createCollage, denormalizeBoxes } from "_utils/imageCalcs";
import {
  drawImageToCanvas,
  drawBoxesToCanvas,
  imageElemFromCanvas,
} from "_utils/imageProcessing";
import { PricetagDetail, Product, Rack } from "_utils/objects";
import { addDetailsToPricetags } from "_utils/pricetags";
import { guessShelvesMock } from "_utils/shelves";
import { useOcr } from "_utils/useOcr";
import RackDisplay from "./RackDisplay";
// import { guessShelves } from "_utils/oldShelves";

type Props = {
  image: File | undefined;
  pricetagGraphModel: GraphModel | null;
  namePriceGraphModel: GraphModel | null;
  // counter?: number;
};

const PRICETAG_CANVAS_SIZE = 640;
const NAME_PRICES_CANVAS_SIZE = 640;

export default function TensorDev(props: Props) {
  const { image, pricetagGraphModel, namePriceGraphModel } = props;
  const [imageUrl, setImageUrl] = useState<string>();
  const imageRef = useRef<HTMLImageElement>(null);
  const [rack, setRack] = useState<Rack>();

  const pricetagModel = useImageModel(pricetagGraphModel, {
    debug: true,
    canvasSize: PRICETAG_CANVAS_SIZE,
  });
  const namePriceModel = useImageModel(namePriceGraphModel, { debug: true });
  const ocr = useOcr();

  const readAndUpdateProducts = async (
    products: Product[],
    image: HTMLImageElement
  ) => {
    // products.forEach(async (product, index) => {
    for (const product of products) {
      console.log(product);

      const nameResult = await ocr.readText(image, product.collage?.name);
      const priceMainResult = await ocr.readText(
        image,
        product.collage?.priceMain
      );
      const priceSubResult = await ocr.readText(
        image,
        product.collage?.priceSub
      );

      product.name = nameResult?.data.text;
      product.priceMain = priceMainResult?.data.text;
      product.priceSub = priceSubResult?.data.text;
    }
  };

  const findNamesAndPrices = async (
    boxes: (TypedArray | number[])[]
  ): Promise<[PricetagDetail[], HTMLImageElement]> => {
    const collage = createCollage(boxes, false);
    const ctx = namePriceModel.getCanvasContext();
    const image = imageRef.current;

    // errorIfNotTrue(!ctx || !image);
    // if (ctx && image) {
    // prepare canvas
    if (!ctx || !image) throw new Error("Image or context not ready");
    const canvas = ctx.canvas;
    namePriceModel.setCanvasSize(collage.size);

    // draw original boxes to canvas
    drawBoxesToCanvas(image, ctx, boxes, collage.boxes);

    // create img element with full size colage
    const collageImg = await imageElemFromCanvas(canvas);

    // resize canvas before model processing and redraw callage
    namePriceModel.setCanvasSize(NAME_PRICES_CANVAS_SIZE);
    drawImageToCanvas(collageImg, ctx);

    const result = await namePriceModel.execute();
    const realBoxes = denormalizeBoxes(
      result.boxes,
      collageImg.naturalWidth,
      collageImg.naturalHeight
    );

    const pricetags = collage.boxes.map((rBox) => new PricetagDetail(rBox));
    addDetailsToPricetags(pricetags, realBoxes, result.classes);

    return [pricetags, collageImg];
  };

  const findPriceTags = async () => {
    const image = imageRef.current;
    const ctx = pricetagModel.getCanvasContext();

    if (image && ctx) {
      drawImageToCanvas(image, ctx);
      const result = await pricetagModel.execute();
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

      console.log("--------------------------------------------------------");
      console.log(rack);

      const boxToRead = sortedProducts[0].collage?.name;
      console.log("boxToRead", boxToRead);

      // if (boxToRead) ocr.readText(collageImg, boxToRead);
      await readAndUpdateProducts(sortedProducts, collageImg);

      setRack(rack);

      console.log(rack);
    }
  };

  const onImageLoad = () => {
    findPriceTags();
  };

  useEffect(() => {
    if (image) {
      const imgUrl = URL.createObjectURL(image);
      console.log("imgUrl", imgUrl);

      setImageUrl(imgUrl);
    }
  }, [image]);

  return (
    <div>
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Used to load uploaded photo"
        onLoad={onImageLoad}
        hidden={true}
      />

      {rack && <RackDisplay rack={rack} />}
    </div>
  );
}
