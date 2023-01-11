import { GraphModel, TypedArray } from "@tensorflow/tfjs";
import { useEffect, useRef, useState } from "react";
import {
  CANVAS_BG_COLOR,
  MODEL_NAME_PRICE_SIZE,
  MODEL_PRICETAG_SIZE,
} from "_constants";
import { Boxes } from "_types";
import { getCollageBoxes, denormalizeBoxes } from "_utils/imageCalcs";
import {
  fitImageToCanvas,
  cropPriceTagToCanvas,
  drawPredictions,
} from "_utils/imageProcessing";
import { executeImageModel } from "_utils/tensor";

type Props = {
  image: File | undefined;
  priceTagModel: GraphModel | undefined;
  namePriceModel: GraphModel | undefined;
  // counter?: number;
};

type Size = { width: number; height: number };

// type TensorResponseArray = Float32Array | Int32Array | Uint8Array;

export default function TensorDev(props: Props) {
  const { image, priceTagModel, namePriceModel } = props;
  const [imageUrl, setImageUrl] = useState<string>();
  const priceTagCanvasRef = useRef<HTMLCanvasElement>(null);
  const namePriceCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageGeneratorCanvasRef = useRef<HTMLCanvasElement>(null);
  // const [imgGenSize, setImgGenSize] = useState<Size>({ width: 0, height: 0 });
  // const secondCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const showSomeDebugBoxes = async (boxes: Boxes) => {
    const canvas = namePriceCanvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });

    const originalCanvas = imageGeneratorCanvasRef.current;

    if (ctx && originalCanvas) {
      const realBoxes = denormalizeBoxes(
        boxes,
        originalCanvas.width,
        originalCanvas.height
      );
      const collage = getCollageBoxes(realBoxes, ctx.canvas.width);

      ctx.fillStyle = CANVAS_BG_COLOR;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      realBoxes.map((box, boxIndex) => {
        const colagBox = collage.boxes[boxIndex];
        cropPriceTagToCanvas(originalCanvas, ctx, box, colagBox);
      });
    }
  };

  const findNamesAndPrices = async (boxes: (TypedArray | number[])[]) => {
    const canvas = imageGeneratorCanvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    const image = imageRef.current;

    if (canvas && namePriceModel && ctx && image) {
      const realBoxes = denormalizeBoxes(
        boxes,
        image.naturalWidth,
        image.naturalHeight
      );
      // console.log("realBoxes", ...realBoxes);

      const collage = getCollageBoxes(realBoxes, 400);
      console.log("height, width", collage.height, collage.width);

      // setImgGenSize({ width: collage.width, height: collage.height });
      canvas.width = collage.width;
      canvas.height = collage.height;

      ctx.fillStyle = CANVAS_BG_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      console.log("canvas.width", canvas.width);

      realBoxes.map((box, boxIndex) => {
        const colagBox = collage.boxes[boxIndex];
        cropPriceTagToCanvas(image, ctx, box, colagBox);
      });

      // execute NamePrice model
      const namesPricesResult = await executeImageModel(namePriceModel, canvas);
      showSomeDebugBoxes(namesPricesResult.boxes);
    }
  };

  const findPriceTags = async () => {
    const canvas = priceTagCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = imageRef.current;

    if (canvas && priceTagModel && ctx && image) {
      fitImageToCanvas(image, canvas, ctx);

      const {
        boxes,
        scores,
        validDetections: _asd,
      } = await executeImageModel(priceTagModel, canvas);

      // const oneBoxes = boxes.slice(0, 1);
      console.log(boxes);

      // Uncomment FOR DEBUGGING PURPOSES
      drawPredictions(
        canvas,
        ctx,
        boxes,
        [...scores].map((s) => s.toFixed(2))
      );

      findNamesAndPrices(boxes);
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
        ref={priceTagCanvasRef}
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
