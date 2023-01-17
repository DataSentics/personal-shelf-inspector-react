import { GraphModel, TypedArray } from "@tensorflow/tfjs";
import { useEffect, useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import {
  CANVAS_BG_COLOR,
  MODEL_NAME_PRICE_SIZE,
  MODEL_PRICETAG_SIZE,
} from "_constants";
import { Boxes } from "_types";
import { getCollageBoxes, denormalizeBoxes } from "_utils/imageCalcs";
import {
  drawImageToCanvas,
  cropPriceTagToCanvas,
  drawPredictions,
} from "_utils/imageProcessing";
import { BBox, PricetagCoords, PricetagMulti } from "_utils/objects";
import { addDetailsToPricetags } from "_utils/pricetags";
import { executeImageModel } from "_utils/tensor";

type Props = {
  image: File | undefined;
  priceTagModel: GraphModel | undefined;
  namePriceModel: GraphModel | undefined;
  // counter?: number;
};

export default function TensorDev(props: Props) {
  const { image, priceTagModel, namePriceModel } = props;
  const [imageUrl, setImageUrl] = useState<string>();
  const photoCanvasRef = useRef<HTMLCanvasElement>(null);
  const namePriceCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageGeneratorCanvasRef = useRef<HTMLCanvasElement>(null);
  const ocrCanvasRef = useRef<HTMLCanvasElement>(null);
  // const [imgGenSize, setImgGenSize] = useState<Size>({ width: 0, height: 0 });
  // const secondCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const ocrRef = useRef<Tesseract.Worker>();

  useEffect(() => {
    const perform = async () => {
      const worker = await createWorker({
        logger: (m) => console.log(m),
      });
      ocrRef.current = worker;
    };
    perform();
  }, []);

  // const showSomeDebugBoxes = async (boxes: Boxes) => {
  //   const canvas = namePriceCanvasRef.current;
  //   const ctx = canvas?.getContext("2d", { alpha: false });

  //   const originalCanvas = imageGeneratorCanvasRef.current;

  //   if (ctx && originalCanvas) {
  //     const realBoxes = denormalizeBoxes(
  //       boxes,
  //       originalCanvas.width,
  //       originalCanvas.height
  //     );
  //     const collage = getCollageBoxes(realBoxes, ctx.canvas.width);

  //     ctx.fillStyle = CANVAS_BG_COLOR;
  //     ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  //     realBoxes.map((box, boxIndex) => {
  //       const colagBox = collage.boxes[boxIndex];
  //       cropPriceTagToCanvas(originalCanvas, ctx, box, colagBox);
  //     });
  //   }
  // };

  const readText = async (bbox: number[]) => {
    await ocrRef.current?.load();
    // Loadingg language as 'English'
    await ocrRef.current?.loadLanguage("eng");
    await ocrRef.current?.initialize("eng");

    // Sending the File Object into the Recognize function to
    // parse the data
    // const res = await ocrRef.current?.recognize(file.file);
  };

  const findNamesAndPrices = async (boxes: (TypedArray | number[])[]) => {
    const canvas = imageGeneratorCanvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    const image = imageRef.current;

    if (canvas && namePriceModel && ctx && image) {
      // console.log("realBoxes", ...realBoxes);

      const collage = getCollageBoxes(boxes, false);
      console.log("height, width", collage.height, collage.width);
      const collageSize = Math.max(collage.width, collage.height);

      // setImgGenSize({ width: collage.width, height: collage.height });
      canvas.width = collageSize;
      canvas.height = collageSize;

      ctx.fillStyle = CANVAS_BG_COLOR;
      ctx.fillRect(0, 0, collageSize, collageSize);
      console.log("canvas.width", canvas.width);

      boxes.map((box, boxIndex) => {
        const colagBox = collage.boxes[boxIndex];
        cropPriceTagToCanvas(image, ctx, box, colagBox);
      });

      // execute NamePrice model
      const namesPricesResult = await executeImageModel(namePriceModel, canvas);
      const namesPricesRealBoxes = denormalizeBoxes(
        namesPricesResult.boxes,
        canvas.width,
        canvas.height
      );
      // showSomeDebugBoxes(namesPricesResult.boxes);

      const pricetags = collage.boxes.map((rBox) => new PricetagCoords(rBox));
      addDetailsToPricetags(
        pricetags,
        namesPricesRealBoxes,
        namesPricesResult.classes
      );
      console.log(pricetags);
    }
  };

  const findPriceTags = async () => {
    const canvas = photoCanvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    const image = imageRef.current;

    if (canvas && priceTagModel && ctx && image) {
      drawImageToCanvas(image, ctx);

      const result = await executeImageModel(priceTagModel, canvas);
      const realBoxes = denormalizeBoxes(
        result.boxes,
        image.naturalWidth,
        image.naturalHeight
      );
      // const collage = getCollageBoxes(realBoxes, 640);

      // const collagePricetags = coll

      // const pricetags = realBoxes.map(
      //   (rBox, boxIndex) => new PricetagMulti(rBox, collage.boxes[boxIndex])
      // );

      // console.log(pricetags);

      // Uncomment FOR DEBUGGING PURPOSES
      drawPredictions(
        canvas,
        ctx,
        result.boxes,
        [...result.scores].map((s) => s.toFixed(2))
      );

      findNamesAndPrices(realBoxes);
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
      <canvas // priceTagModelCanvas
        ref={photoCanvasRef}
        width={MODEL_PRICETAG_SIZE}
        height={MODEL_PRICETAG_SIZE}
      />

      <div>
        <button type="button" onClick={findPriceTags}>
          Execute analysis again
        </button>
      </div>

      <p>imageGeneratorCanvasRef</p>
      <canvas // imageGeneratorCanvasRef
        ref={imageGeneratorCanvasRef}
        width={0}
        height={0}
      />

      <p>namesAndPricesModelCanvas</p>
      <canvas // namesAndPricesModelCanvas
        ref={namePriceCanvasRef}
        width={MODEL_NAME_PRICE_SIZE}
        height={MODEL_NAME_PRICE_SIZE}
      />

      <p>ocrCanvasRef</p>
      <canvas // ocrCanvasRef
        ref={ocrCanvasRef}
      />

      <img
        ref={imageRef}
        id="canvas"
        src={imageUrl}
        alt="Hahaha"
        onLoad={onImageLoad}
        hidden={true}
      />
    </div>
  );
}
