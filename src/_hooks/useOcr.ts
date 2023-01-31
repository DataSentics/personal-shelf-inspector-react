import { useCallback, useEffect, useRef } from "react";
import { createWorker } from "tesseract.js";

import { OCR_ENGINE_MODE, OCR_TESSERACT_LANG } from "_constants";
import { getCanvasFromBox } from "_utils/imageProcessing";
import { BBox } from "../_utils/objects";
import { PerfMeter } from "../_utils/other";

const workerPath = "tesseract/worker.min.js";
const langPath = "tesseract/lang_data";
const corePath = "tesseract/tesseract-core.wasm.js";

function useOcr() {
  const ocrRef = useRef<Tesseract.Worker>();

  useEffect(() => {
    const init = async () => {
      const worker = await createWorker({
        workerPath,
        langPath,
        corePath,
        // logger: (m) => console.log(m),
      });
      ocrRef.current = worker;
      await worker.loadLanguage(OCR_TESSERACT_LANG);

      const perf = new PerfMeter("Tesseract worker init");
      await worker.initialize(OCR_TESSERACT_LANG, OCR_ENGINE_MODE);
      perf.end();
    };
    init();

    return () => {
      if (ocrRef.current) {
        ocrRef.current.terminate();
      }
    };
  }, []);

  const readText = useCallback(
    async (imageSource: HTMLImageElement, bbox?: BBox) => {
      // console.log(bbox);

      if (!bbox) return undefined;
      const ocr = ocrRef.current;

      const canvasCtx = getCanvasFromBox(imageSource, bbox);

      if (!ocr) throw new Error("Canvas or ocr not ready");

      const result2 = await ocr.recognize(canvasCtx.canvas);

      return result2;
    },
    []
  );

  return [readText];
}

export default useOcr;
