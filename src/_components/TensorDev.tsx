import { GraphModel, image as tfImage, tidy as tfTidy } from "@tensorflow/tfjs";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { tensorFromCanvas } from "_utils/imageProcessing";

const tf = require("@tensorflow/tfjs");

const MODEL_SIZE = 640;

type Props = {
  image: File | undefined;
  priceTagModel: GraphModel | undefined;
};

const cropToCanvas = (
  image: EventTarget & HTMLImageElement,
  canvas: any,
  ctx: any
) => {
  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;

  // canvas.width = image.width;
  // canvas.height = image.height;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const ratio = Math.min(
    canvas.width / image.naturalWidth,
    canvas.height / image.naturalHeight
  );
  const newWidth = Math.round(naturalWidth * ratio);
  const newHeight = Math.round(naturalHeight * ratio);
  ctx.drawImage(
    image,
    0,
    0,
    naturalWidth,
    naturalHeight,
    (canvas.width - newWidth) / 2,
    (canvas.height - newHeight) / 2,
    newWidth,
    newHeight
  );
};

// export const getDetectedPricetagImages = async (
//   analyzedImage: CapturedImage,
//   mlModel: GraphModel | undefined,
//   numberOfClassesInModelOutput: number,
//   resizedImgSize: number,
// ): Promise<DetectedImageInfo[] | undefined> => {
//   const { imageTensor, resizedImageUri } = await imagePreprocessiong(
//     analyzedImage,
//     resizedImgSize,
//   );
//   let prediction: number[];

//   prediction = await startPrediction(mlModel, imageTensor);

//   if (prediction && prediction.length > 0) {
//     const detectedImages: DetectedImageInfo[] = await mlModelOutputPostProcessing(
//       numberOfClassesInModelOutput,
//       resizedImgSize,
//       prediction,
//       resizedImageUri,
//       analyzedImage,
//       resizedImgSize,
//     );
//     return detectedImages;
//   }
// };

export default function TensorDev(props: Props) {
  const { image, priceTagModel } = props;
  const [imageUrl, setImageUrl] = useState<string>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImageChange = (evt: SyntheticEvent<HTMLImageElement, Event>) => {
    const canvas = canvasRef.current;

    console.log("onImageChange", canvas, priceTagModel);

    if (canvas && priceTagModel) {
      const ctx = canvas?.getContext("2d");
      cropToCanvas(evt.currentTarget, canvas, ctx);

      let [modelWidth, modelHeight] = priceTagModel.inputs[0].shape?.slice(
        1,
        3
      ) || [MODEL_SIZE, MODEL_SIZE];
      // let a = priceTagModel?.inputs[0].shape?.slice(1, 3);

      const tensor = tensorFromCanvas(canvas, modelWidth, modelHeight);
      console.log("tensor", tensor);

      priceTagModel.executeAsync(tensor).then((res) => {
        console.log(res);

        if (Array.isArray(res)) {
          const [boxes, scores, classes, validDetections] = res;
          const boxes_data = boxes.dataSync();
          const scores_data = scores.dataSync();
          const classes_data = classes.dataSync();
          const valid_detectionsData = validDetections.dataSync()[0];

          console.log(boxes_data);
          console.log(scores_data);
          console.log(classes_data);
          console.log(valid_detectionsData);
        }
      });

      // const output = priceTagModel.predict(tensor);
      // console.log(output);
      // output.
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
      <img id="canvas" src={imageUrl} alt="Hahaha" onLoad={onImageChange} />
    </div>
  );
}
