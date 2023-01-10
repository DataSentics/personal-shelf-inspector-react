import { GraphModel } from "@tensorflow/tfjs";
import { useEffect, useRef, useState } from "react";
import { MODEL_PRICETAG_MIN_SCORE, MODEL_PRICETAG_SIZE } from "_constants";
import {
  cropImageToCanvas,
  drawPredictions,
  executeImageModel,
} from "_utils/imageProcessing";

// const tf = require("@tensorflow/tfjs");

// const MODEL_SIZE = 640;
// const SCORE_MIN = 0.25;

type Props = {
  image: File | undefined;
  priceTagModel: GraphModel | undefined;
  // counter?: number;
};

// type TensorResponseArray = Float32Array | Int32Array | Uint8Array;

export default function TensorDev(props: Props) {
  const { image, priceTagModel } = props;
  const [imageUrl, setImageUrl] = useState<string>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const secondCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const findPriceTags = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = imageRef.current;

    if (canvas && priceTagModel && ctx && image) {
      cropImageToCanvas(image, canvas, ctx);

      const {
        boxes,
        scores,
        validDetections: _asd,
      } = await executeImageModel(
        priceTagModel,
        canvas,
        // 0
        MODEL_PRICETAG_MIN_SCORE
      );

      drawPredictions(
        canvas,
        ctx,
        boxes,
        [...scores].map((s) => s.toFixed(2))
      );
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
      <canvas
        ref={canvasRef}
        width={MODEL_PRICETAG_SIZE}
        height={MODEL_PRICETAG_SIZE}
      />
      {/* <p>{counter}</p> */}
      <div>
        <button type="button" onClick={findPriceTags}>
          Execute analysis again
        </button>
        {/* <p>{firstRectDims.join(", ")}</p> */}
      </div>
      {/* <canvas ref={secondCanvasRef} width={MODEL_SIZE} height={MODEL_SIZE} /> */}
      <img
        ref={imageRef}
        id="canvas"
        src={imageUrl}
        alt="Hahaha"
        onLoad={onImageLoad}
      />
    </div>
  );
}
