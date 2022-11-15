// import { GraphModel } from "@tensorflow/tfjs";

import { browser, image, tidy } from "@tensorflow/tfjs";

// export const getDetectedPricetagImages = async (
//   analyzedImage: CapturedImage,
//   mlModel: GraphModel | undefined,
//   numberOfClassesInModelOutput: number,
//   resizedImgSize: number
// ): Promise<DetectedImageInfo[] | undefined> => {
//   const { imageTensor, resizedImageUri } = await imagePreprocessiong(
//     analyzedImage,
//     resizedImgSize
//   );
//   let prediction: number[];

//   prediction = await startPrediction(mlModel, imageTensor);

//   if (prediction && prediction.length > 0) {
//     const detectedImages: DetectedImageInfo[] =
//       await mlModelOutputPostProcessing(
//         numberOfClassesInModelOutput,
//         resizedImgSize,
//         prediction,
//         resizedImageUri,
//         analyzedImage,
//         resizedImgSize
//       );
//     return detectedImages;
//   }
// };

export const tensorFromCanvas = (
  canvas: HTMLCanvasElement,
  modelWidth: number,
  modelHeight: number
) =>
  tidy(() =>
    image
      .resizeBilinear(browser.fromPixels(canvas), [modelWidth, modelHeight])
      .div(255.0)
      .expandDims(0)
  );

// export const x = 1;
