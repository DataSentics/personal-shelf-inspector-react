import { useEffect, useState } from "react";
import { GraphModel, loadGraphModel } from "@tensorflow/tfjs";

import { Camera, TensorDev } from "_components";
import {
  MODEL_NAME_PRICE_PATH,
  // MODEL_NAME_PRICE_SIZE,
  MODEL_PRICETAG_PATH,
} from "_constants";

const loadingState = (model: GraphModel | undefined) =>
  model ? "Loaded!" : "Loading...";

function Main() {
  const [photo, setPhoto] = useState<File>();
  const [priceTagModel, setPriceTagModel] = useState<GraphModel>();
  const [namePriceModel, setNamePriceModel] = useState<GraphModel>();
  // const [photoUrl, setPhotoUrl] = useState<string>();

  // console.log(photo);

  useEffect(() => {
    loadGraphModel(MODEL_PRICETAG_PATH).then((mdl) => setPriceTagModel(mdl));
    loadGraphModel(MODEL_NAME_PRICE_PATH).then((mdl) => setNamePriceModel(mdl));
  }, []);

  const onPhotoTaken = (newPhoto: File) => {
    // const objectUrl = URL.createObjectURL(newPhoto);

    // setPhotoUrl(objectUrl);
    setPhoto(newPhoto);
  };

  return (
    <div style={{ padding: "0.5rem" }}>
      <h2>Personal Shelf</h2>
      <p>PriceTags model: {loadingState(priceTagModel)}</p>
      <p>Names&Prices model: {loadingState(namePriceModel)}</p>
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
      <TensorDev
        image={photo}
        priceTagModel={priceTagModel}
        namePriceModel={namePriceModel}
      />
    </div>
  );
}

export default Main;
