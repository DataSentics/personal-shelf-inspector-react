import { useCallback, useEffect, useRef } from "react";
import { createWorker } from "tesseract.js";

import { OCR_TESSERACT_LANG } from "_constants";
import { BBox } from "./objects";
import { PerfMeter } from "./other";

export function useOcr() {
  const ocrRef = useRef<Tesseract.Worker>();

  useEffect(() => {
    const init = async () => {
      const worker = await createWorker({
        // logger: (m) => console.log(m),
      });
      ocrRef.current = worker;
      await worker.loadLanguage(OCR_TESSERACT_LANG);

      const perf = new PerfMeter("Tesseract worker init");
      await worker.initialize(OCR_TESSERACT_LANG);
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
      if (!bbox) return undefined;

      const ocr = ocrRef.current;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: false });

      canvas.width = bbox.width;
      canvas.height = bbox.height;

      if (!ctx || !ocr) throw new Error("Canvas or ocr not ready");
      ctx.drawImage(
        imageSource,
        bbox.x1,
        bbox.y1,
        bbox.width,
        bbox.height,
        0,
        0,
        bbox.width,
        bbox.height
      );

      const perf = new PerfMeter("toDataUrl");
      // const imgToRead = canvas.toDataURL();
      // perf.end();

      // const perf = new PerfMeter("toDataUrl");
      // const dbg = originalCanvas.getContext("2d");
      // perf.start("blobToRead");
      const blobToRead: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve)
      );
      // perf.end();
      // console.log(blobToRead);

      // setDebugImageUrl(debugImgUrl?.colorSpace);

      // // await ocr.loadLanguage("eng");
      // perf.start("ocr.init");
      // await ocr.initialize(OCR_TESSERACT_LANG);
      // perf.end();

      // perf.start("ocr.recognize");
      // const result = await ocr.recognize(imgToRead);
      // perf.end();

      // console.log(result.data.text);
      // console.log(result);

      perf.start("ocr.recognize - blob");
      const result2 = blobToRead && (await ocr.recognize(blobToRead));
      perf.end();
      // console.log(result2?.data.text);
      console.log(result2);

      return result2;
    },
    []
  );

  return { readText };
}
