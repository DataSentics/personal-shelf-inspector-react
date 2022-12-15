import { GraphModel } from "@tensorflow/tfjs";
import { useEffect, useRef, useState } from "react";
import {
  cropImageToCanvas,
  drawPredictions,
  executeModel,
} from "_utils/imageProcessing";

// const tf = require("@tensorflow/tfjs");

const MODEL_SIZE = 640;

type Props = {
  image: File | undefined;
  priceTagModel: GraphModel | undefined;
  counter?: number;
};

// type TensorResponseArray = Float32Array | Int32Array | Uint8Array;

export default function TensorDev(props: Props) {
  const { image, priceTagModel, counter } = props;
  const [imageUrl, setImageUrl] = useState<string>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const secondCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const onImageChange = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = imageRef.current;

    if (canvas && priceTagModel && ctx && image) {
      cropImageToCanvas(image, canvas, ctx);

      const tensorRanks = await executeModel(priceTagModel, canvas);
      // drawPredictions(tensorRanks, canvas, ctx);

      if (Array.isArray(tensorRanks)) {
        const [boxes, scores, classes, validDetections] = tensorRanks;
        const validDetectionsData = validDetections.dataSync()[0];
        const validBoxes = boxes.dataSync().slice(0, validDetectionsData * 4);

        console.log(validBoxes);
      }
    }
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
      <canvas ref={canvasRef} width={MODEL_SIZE} height={MODEL_SIZE} />
      <p>{counter}</p>
      <div>
        <button
          type="button"
          // onClick={() => {
          //   console.log(imageEvent?.naturalHeight);
          // }}
        >
          Process something
        </button>
        {/* <p>{firstRectDims.join(", ")}</p> */}
      </div>
      <canvas ref={secondCanvasRef} width={MODEL_SIZE} height={MODEL_SIZE} />
      <img
        ref={imageRef}
        id="canvas"
        src={imageUrl}
        alt="Hahaha"
        onLoad={onImageChange}
      />
    </div>
  );
}
