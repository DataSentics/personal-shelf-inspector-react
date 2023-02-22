import { useCallback, useEffect, useRef } from "react";
import { createWorker } from "tesseract.js";
import { OCR_ENGINE_MODE, OCR_TESSERACT_LANG } from "_constants";

import type { BBox } from "../_utils/objects";
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
    async (
      imageSource: HTMLImageElement,
      bbox?: BBox,
      options: { numbersOnly?: boolean } = {}
    ) => {
      const { numbersOnly } = options;

      if (!bbox) return undefined;

      const ocr = ocrRef.current;
      if (!ocr) throw new Error("Canvas or ocr not ready");

      if (numbersOnly)
        // doesn't seem to impact performance noticeably
        ocr?.setParameters({
          tessedit_char_whitelist: "0123456789",
        });
      else
        ocr?.setParameters({
          tessedit_char_whitelist: "",
        });

      const rectangle = bbox.rectangle;
      const result2 = await ocr.recognize(imageSource, { rectangle });

      return result2;
    },
    []
  );

  return [readText];
}

export default useOcr;
