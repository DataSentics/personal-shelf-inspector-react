import { GraphModel, loadGraphModel } from "@tensorflow/tfjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { drawPredictions } from "_utils/imageProcessing";
import { executeImageModel, getModelSize, ReshapedOutput } from "_utils/tensor";

type UseModelOptions = {
  isDebug?: boolean; // flag that determines whether to render canvas with predictions
  canvasSize?: number; // width and height of canvas, if not specified, it will try to take from model
};

type UseImageModelReturn = [
  ReshapedOutput | undefined,
  {
    model: GraphModel | undefined;
    execute: () => Promise<ReshapedOutput>;
    canvasRef: React.MutableRefObject<HTMLCanvasElement>;
    getCanvasContext: () => CanvasRenderingContext2D | null;
    setCanvasSize: (size: number) => void;
    reset: () => void;
  }
];

/**
 * Custom hook for handling image model execution.
 */
function useImageModel(
  modelSource: string | GraphModel | null,
  options: UseModelOptions = {}
): UseImageModelReturn {
  const { isDebug, canvasSize } = options;
  const [model, setModel] = useState<GraphModel>();
  const [result, setResult] = useState<ReshapedOutput>();
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));

  // set model or load the model based on a string URL
  useEffect(() => {
    if (typeof modelSource === "string") {
      loadGraphModel(modelSource).then((mdl) => setModel(mdl));
      return;
    }
    if (modelSource) setModel(modelSource);
  }, [modelSource]);

  useEffect(() => {
    if (isDebug) {
      const htmlBody = document.getElementsByTagName("main")[0] as HTMLElement;
      const canvasElem = canvasRef.current;
      htmlBody.appendChild(canvasElem);

      return () => {
        htmlBody.removeChild(canvasElem);
      };
    }
  }, [isDebug]);

  const setCanvasSize = useCallback((size: number) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = size;
      canvas.height = size;
    }
  }, []);

  // execute the model on the canvas
  const execute = useCallback(async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });

    if (!ctx || !model) throw new Error("Image or context not ready");
    const result = await executeImageModel(model, canvas);
    setResult(result);

    // Draws the predictions on the canvas if the `debug` option is passed
    if (isDebug)
      drawPredictions(
        canvas,
        ctx,
        result.boxes,
        [...result.scores].map((s) => s.toFixed(2))
      );

    return result;
  }, [model, isDebug]);

  // getCanvasContext function that can be used to get the 2D rendering context of the canvas
  const getCanvasContext = useCallback(
    () => canvasRef.current.getContext("2d", { alpha: false }),
    []
  );

  // set the canvas size if the `canvasSize` option is passed
  useEffect(() => {
    if (!model) return;
    if (canvasSize) {
      setCanvasSize(canvasSize);
      return;
    }
    const modelSize = getModelSize(model);
    if (modelSize) {
      setCanvasSize(modelSize[0]);
      return;
    }

    console.warn("Canvas size not set");
  }, [canvasSize, model, setCanvasSize]);

  const reset = useCallback(() => {
    setResult(undefined);
  }, []);

  // exports the `canvasRef` and `result` as object properties which allows you to access the canvas element and the result of the execution of the model respectively.
  const functionsObject = useMemo(() => {
    return {
      model,
      execute,
      canvasRef,
      getCanvasContext,
      setCanvasSize,
      reset,
    };
  }, [model, execute, canvasRef, getCanvasContext, setCanvasSize, reset]);

  return [result, functionsObject];
}

export default useImageModel;

// function assertTrue<T extends boolean | undefined>(value: T): asserts value is undefined {
//   if (value) throw new Error("Assertion failed");
//   return true;
// }
