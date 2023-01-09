import { useEffect, useState } from "react";
import { GraphModel, loadGraphModel } from "@tensorflow/tfjs";
// import { io } from "@tensorflow/tfjs-core";

import { Camera, TensorDev } from "_components";
import { MODEL_PRICETAG_PATH } from "_constants";

// const weightsPriceTags = "/web_models/pricetags/model.json";

function Main() {
  const [photo, setPhoto] = useState<File>();
  // const [photoUrl, setPhotoUrl] = useState<string>();
  const [model, setModel] = useState<GraphModel>();
  const [counter, setCounter] = useState<number>(0);

  console.log(photo);

  useEffect(() => {
    loadGraphModel(MODEL_PRICETAG_PATH).then((mdl) => setModel(mdl));
  }, []);

  const onImageChange = () => {
    // await getDetectedPricetagImages(
    //   capturedImage,
    //   findPricetagModel,
    //   1,
    //   RESIZE_IMG_320,
    // );
    // let [modelWidth, modelHeight] = model?.inputs?[0].shape.slice(1, 3);
  };

  const executeDev = () => {
    console.log(model?.inputs[0].shape?.slice(1, 3));
  };

  const onPhotoTaken = (newPhoto: File) => {
    const objectUrl = URL.createObjectURL(newPhoto);

    // setPhotoUrl(objectUrl);
    setPhoto(newPhoto);
  };

  const increaseCounter = () => setCounter((cur) => cur + 1);

  return (
    <div style={{ padding: "0.5rem" }}>
      <h2>Personal Shelf</h2>
      <p>Model state: {model ? "Loaded!" : "Loading..."}</p>
      <p>
        <label htmlFor="imageFile">
          Upload a photo of shop shelf using button below
        </label>
      </p>
      <Camera onPhotoTaken={onPhotoTaken}>
        <button>Take photo</button>
      </Camera>
      {/* <button onClick={executeDev} type="button">
        Execute dev
      </button>
      <button onClick={increaseCounter} type="button">
        Increase Counter
      </button> */}
      {/* <div>
        <img src={photoUrl} alt="From camera"></img>
      </div> */}
      <TensorDev image={photo} priceTagModel={model} />
    </div>
  );
}

export default Main;
