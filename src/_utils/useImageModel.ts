import { GraphModel, loadGraphModel } from "@tensorflow/tfjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { drawPredictions } from "./imageProcessing";
import { executeImageModel, ReshapedOutput } from "./tensor";

type UseModelOptions = {
  debug?: boolean; // flag that determines whether to display predictions on the canvas
  canvasSize?: number; // width and height of canvas, if not specified
};

export function useImageModel(
  modelSource: string | GraphModel | null,
  options: UseModelOptions = {}
) {
  const { debug: isDebug } = options;
  const [model, setModel] = useState<GraphModel>();
  const [result, setResult] = useState<ReshapedOutput>();
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  //   const [canvasDomId] = useState(UUID.get());

  // set model or load the model based on a string URL
  useEffect(() => {
    if (typeof modelSource === "string") {
      loadGraphModel(modelSource).then((mdl) => setModel(mdl));
      return;
    }
    if (modelSource) setModel(modelSource);
  }, [modelSource]);

  // set the canvas size if the `canvasSize` option is passed
  useEffect(() => {
    const { canvasSize } = options;
    if (canvasSize) {
      canvasRef.current.width = canvasSize;
      canvasRef.current.height = canvasSize;
    }
  }, [options.canvasSize]);

  useEffect(() => {
    const htmlBody = document.getElementsByTagName("body")[0];
    const canvasElem = canvasRef.current;

    htmlBody?.appendChild(canvasElem);

    if (isDebug) {
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

    if (canvas && model && ctx) {
      const result = await executeImageModel(model, canvas);
      setResult(result);

      // Draws the predictions on the canvas if the `debug` option is passed
      if (options.debug)
        drawPredictions(
          canvas,
          ctx,
          result.boxes,
          [...result.scores].map((s) => s.toFixed(2))
        );
      return result;
    } else {
      console.warn(`Problem with model '${model}' or canvas '${canvas}'`);
      throw new Error("Model or canvas are not loaded");
    }
  }, [model, canvasRef]);

  // getCanvasContext function that can be used to get the 2D rendering context of the canvas
  const getCanvasContext = useCallback(
    () => canvasRef.current.getContext("2d", { alpha: false }),
    []
  );

  // exports the `canvasRef` and `result` as object properties which allows you to access the canvas element and the result of the execution of the model respectively.
  return { result, model, execute, canvasRef, getCanvasContext, setCanvasSize };
}
