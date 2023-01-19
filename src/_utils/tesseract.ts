import { createWorker } from "tesseract.js";

const createMyWorker = createWorker({
  logger: (m) => console.log(m),
});

// export const
