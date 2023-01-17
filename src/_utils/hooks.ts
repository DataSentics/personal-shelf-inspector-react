import { GraphModel } from "@tensorflow/tfjs";
import { useCallback, useEffect, useState } from "react";
// import { executeImageModel, ReshapedOutput } from "./tensor";

// export function useImageModel(
//   model: GraphModel,
//   canvasRef: React.RefObject<HTMLCanvasElement>
// ) {
//   const [result, setResult] = useState<ReshapedOutput>();

//   const execute = useCallback(async () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext("2d", { alpha: false });
//     // const image = imageRef.current;

//     if (canvas && model) {
//       const result = await executeImageModel(model, canvas);
//       setResult(result);
//       return result;
//     }
//   }, [model, canvasRef]);

//   return { result };
// }

export const a = 3;
